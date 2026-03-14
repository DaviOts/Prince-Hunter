import { Test, TestingModule } from '@nestjs/testing';
import { ScraperService } from './scraper.service';
import { CacheService } from 'src/cache/cache.service';
import {
  PriceResult,
  ScraperStrategy,
} from './strategies/scraper-strategy.interface';

describe('ScraperService', () => {
  let service: ScraperService;

  const mockCacheService = {
    getPrices: jest.fn(),
    setPrices: jest.fn(),
  };

  const createMockStrategy = (
    slug: string,
    prices: PriceResult[],
  ): ScraperStrategy => ({
    storeSlug: slug,
    getPrice: jest.fn().mockResolvedValue(prices),
  });

  const steamPrice: PriceResult = {
    appId: 1245620,
    finalPrice: 199.9,
    initialPrice: 249.9,
    discountPercent: 20,
    storeSlug: 'steam',
    url: 'https://store.steampowered.com/app/1245620',
    canonicalTitle: 'ELDEN RING',
  };

  const gogPrice: PriceResult = {
    appId: 100,
    finalPrice: 189.9,
    initialPrice: 249.9,
    discountPercent: 24,
    storeSlug: 'gog',
    url: 'https://gog.com/game/elden_ring',
    canonicalTitle: 'ELDEN RING',
  };

  let mockSteamStrategy: ScraperStrategy;
  let mockGogStrategy: ScraperStrategy;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockSteamStrategy = createMockStrategy('steam', [steamPrice]);
    mockGogStrategy = createMockStrategy('gog', [gogPrice]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScraperService,
        {
          provide: 'SCRAPER_STRATEGY',
          useValue: [mockSteamStrategy, mockGogStrategy],
        },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<ScraperService>(ScraperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scrapeAll', () => {
    it('should return cached prices and skip strategy call on cache hit', async () => {
      mockCacheService.getPrices.mockResolvedValue([steamPrice]);

      const result = await service.scrapeAll('Elden Ring');

      expect(mockSteamStrategy.getPrice).not.toHaveBeenCalled();
      expect(result).toContainEqual(steamPrice);
    });

    it('should call strategy and cache result on cache miss', async () => {
      mockCacheService.getPrices.mockResolvedValue(null);
      mockCacheService.setPrices.mockResolvedValue(undefined);

      const result = await service.scrapeAll('Elden Ring');

      expect(mockSteamStrategy.getPrice).toHaveBeenCalledWith('Elden Ring');
      expect(mockGogStrategy.getPrice).toHaveBeenCalledWith('Elden Ring');
      expect(mockCacheService.setPrices).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(steamPrice);
      expect(result).toContainEqual(gogPrice);
    });

    it('should return empty array and skip caching when no prices found', async () => {
      mockCacheService.getPrices.mockResolvedValue(null);
      (mockSteamStrategy.getPrice as jest.Mock).mockResolvedValue([]);
      (mockGogStrategy.getPrice as jest.Mock).mockResolvedValue([]);

      const result = await service.scrapeAll('NonExistentGame');

      expect(result).toEqual([]);
      expect(mockCacheService.setPrices).not.toHaveBeenCalled();
    });

    it('should handle mixed cache hits and misses', async () => {
      mockCacheService.getPrices
        .mockResolvedValueOnce([steamPrice])
        .mockResolvedValueOnce(null);
      mockCacheService.setPrices.mockResolvedValue(undefined);

      const result = await service.scrapeAll('Elden Ring');

      expect(mockSteamStrategy.getPrice).not.toHaveBeenCalled();
      expect(mockGogStrategy.getPrice).toHaveBeenCalledWith('Elden Ring');
      expect(mockCacheService.setPrices).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
    });
  });
});
