import { Test, TestingModule } from '@nestjs/testing';
import { ScraperProcessor } from './scraper.processor';
import { ScraperService } from './scraper.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { PriceResult } from './strategies/scraper-strategy.interface';
import { Decimal } from '@prisma/client/runtime/client';
import { CacheService } from 'src/cache/cache.service';

// Typed mock matching ScrapeJobData shape
interface MockJobData {
  gameTitle: string;
  gameId: string;
}

interface MockJob {
  data: MockJobData;
}

describe('ScraperProcessor', () => {
  let processor: ScraperProcessor;

  const mockScraperService = {
    scrapeAll: jest.fn(),
  };

  const mockPrisma = {
    game: {
      update: jest.fn(),
    },
    store: {
      findUnique: jest.fn(),
    },
    price: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockCacheService = {
    getPrices: jest.fn(),
    setPrices: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScraperProcessor,
        { provide: ScraperService, useValue: mockScraperService },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: 'SCRAPER_STRATEGY', useValue: [] },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    processor = module.get<ScraperProcessor>(ScraperProcessor);
  });

  const createJob = (data: MockJobData): MockJob => ({ data });

  const steamPrice: PriceResult = {
    appId: 1245620,
    finalPrice: 199.9,
    initialPrice: 249.9,
    discountPercent: 20,
    storeSlug: 'steam',
    url: 'https://store.steampowered.com/app/1245620',
    canonicalTitle: 'ELDEN RING',
  };

  it('should do nothing when no prices are found', async () => {
    mockScraperService.scrapeAll.mockResolvedValue([]);

    const job = createJob({ gameTitle: 'Ghost Game', gameId: 'g1' });
    await processor.process(job as never);

    expect(mockPrisma.game.update).not.toHaveBeenCalled();
    expect(mockPrisma.price.create).not.toHaveBeenCalled();
  });

  it('should update game title with canonical title and save prices', async () => {
    mockScraperService.scrapeAll.mockResolvedValue([steamPrice]);
    mockPrisma.game.update.mockResolvedValue({});
    mockPrisma.store.findUnique.mockResolvedValue({
      id: 'store-1',
      slug: 'steam',
    });
    mockPrisma.price.findFirst.mockResolvedValue(null);
    mockPrisma.price.create.mockResolvedValue({});

    const job = createJob({ gameTitle: 'elden ring', gameId: 'g1' });
    await processor.process(job as never);

    expect(mockPrisma.game.update).toHaveBeenCalledWith({
      where: { id: 'g1' },
      data: { title: 'ELDEN RING', slug: 'elden-ring' },
    });

    expect(mockPrisma.price.create).toHaveBeenCalledWith({
      data: {
        gameId: 'g1',
        storeId: 'store-1',
        url: steamPrice.url,
        finalPrice: steamPrice.finalPrice,
        originalPrice: steamPrice.initialPrice,
        discountPercent: steamPrice.discountPercent,
      },
    });
  });

  it('should skip price creation when store is not found in DB', async () => {
    mockScraperService.scrapeAll.mockResolvedValue([steamPrice]);
    mockPrisma.game.update.mockResolvedValue({});
    mockPrisma.store.findUnique.mockResolvedValue(null);

    const job = createJob({ gameTitle: 'elden ring', gameId: 'g1' });
    await processor.process(job as never);

    expect(mockPrisma.price.create).not.toHaveBeenCalled();
  });

  it('should skip price creation when price has not changed', async () => {
    mockScraperService.scrapeAll.mockResolvedValue([steamPrice]);
    mockPrisma.game.update.mockResolvedValue({});
    mockPrisma.store.findUnique.mockResolvedValue({
      id: 'store-1',
      slug: 'steam',
    });
    mockPrisma.price.findFirst.mockResolvedValue({
      finalPrice: new Decimal(steamPrice.finalPrice),
    });

    const job = createJob({ gameTitle: 'elden ring', gameId: 'g1' });
    await processor.process(job as never);

    expect(mockPrisma.price.create).not.toHaveBeenCalled();
  });

  it('should create price when price has changed', async () => {
    mockScraperService.scrapeAll.mockResolvedValue([steamPrice]);
    mockPrisma.game.update.mockResolvedValue({});
    mockPrisma.store.findUnique.mockResolvedValue({
      id: 'store-1',
      slug: 'steam',
    });
    mockPrisma.price.findFirst.mockResolvedValue({
      finalPrice: new Decimal(299.9),
    });
    mockPrisma.price.create.mockResolvedValue({});

    const job = createJob({ gameTitle: 'elden ring', gameId: 'g1' });
    await processor.process(job as never);

    expect(mockPrisma.price.create).toHaveBeenCalled();
  });

  it('should fallback to gameTitle when canonicalTitle is missing', async () => {
    const priceWithoutCanonical: PriceResult = {
      appId: 1245620,
      finalPrice: 199.9,
      initialPrice: 249.9,
      discountPercent: 20,
      storeSlug: 'steam',
      url: 'https://store.steampowered.com/app/1245620',
      canonicalTitle: undefined as never,
    };
    mockScraperService.scrapeAll.mockResolvedValue([priceWithoutCanonical]);
    mockPrisma.game.update.mockResolvedValue({});
    mockPrisma.store.findUnique.mockResolvedValue({
      id: 'store-1',
      slug: 'steam',
    });
    mockPrisma.price.findFirst.mockResolvedValue(null);
    mockPrisma.price.create.mockResolvedValue({});

    const job = createJob({ gameTitle: 'Elden Ring', gameId: 'g1' });
    await processor.process(job as never);

    expect(mockPrisma.game.update).toHaveBeenCalledWith({
      where: { id: 'g1' },
      data: { title: 'Elden Ring', slug: 'elden-ring' },
    });
  });
});
