import { Test, TestingModule } from '@nestjs/testing';
import { CacheService, generateKey } from './cache.service';
import { RedisService } from 'src/database/redis/redis.service';
import { PriceResult } from 'src/scraper/strategies/scraper-strategy.interface';

// --- Pure function tests ---
describe('generateKey', () => {
  it('should build key in format price:{store}:{game}', () => {
    expect(generateKey('steam', 'elden-ring')).toBe('price:steam:elden-ring');
  });

  it('should handle empty slugs', () => {
    expect(generateKey('', '')).toBe('price::');
  });
});

// --- Service tests ---
describe('CacheService', () => {
  let service: CacheService;

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
  };

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

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  describe('getPrices', () => {
    it('should return parsed PriceResult[] on cache HIT', async () => {
      mockRedisService.get.mockResolvedValue(JSON.stringify(fakePrices));

      const result = await service.getPrices('steam', 'elden-ring');

      expect(mockRedisService.get).toHaveBeenCalledWith(
        'price:steam:elden-ring',
      );
      expect(result).toEqual(fakePrices);
    });

    it('should return null on cache MISS', async () => {
      mockRedisService.get.mockResolvedValue(null);

      const result = await service.getPrices('steam', 'elden-ring');

      expect(result).toBeNull();
    });
  });

  describe('setPrices', () => {
    it('should serialize prices and call redis set with TTL', async () => {
      mockRedisService.set.mockResolvedValue(undefined);

      await service.setPrices('steam', 'elden-ring', fakePrices, 3600);

      expect(mockRedisService.set).toHaveBeenCalledWith(
        'price:steam:elden-ring',
        JSON.stringify(fakePrices),
        3600,
      );
    });
  });
});
