import { Test, TestingModule } from '@nestjs/testing';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { PriceResult } from './strategies/scraper-strategy.interface';

describe('ScraperController', () => {
  let controller: ScraperController;

  const mockScraperService = {
    scrapeAll: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScraperController],
      providers: [{ provide: ScraperService, useValue: mockScraperService }],
    }).compile();

    controller = module.get<ScraperController>(ScraperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('scrapeByTitle', () => {
    it('should delegate to scraperService.scrapeAll with the game title', async () => {
      const fakePrices: PriceResult[] = [
        {
          appId: 1245620,
          finalPrice: 199.9,
          initialPrice: 249.9,
          discountPercent: 20,
          storeSlug: 'steam',
          url: 'https://store.steampowered.com/app/1245620',
          canonicalTitle: 'ELDEN RING',
        },
      ];
      mockScraperService.scrapeAll.mockResolvedValue(fakePrices);

      const result = await controller.scrapeByTitle('Elden Ring');

      expect(mockScraperService.scrapeAll).toHaveBeenCalledWith('Elden Ring');
      expect(result).toEqual(fakePrices);
    });

    it('should return empty array when no prices found', async () => {
      mockScraperService.scrapeAll.mockResolvedValue([]);

      const result = await controller.scrapeByTitle('NonExistentGame');

      expect(result).toEqual([]);
    });
  });
});
