import { Test, TestingModule } from '@nestjs/testing';
import { ScraperService } from './scraper.service';
import { CacheService } from 'src/cache/cache.service';

describe('ScraperService', () => {
  let service: ScraperService;

  const mockCacheService = {
    getPrices: jest.fn(),
    setPrices: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScraperService,
        {
          provide: 'SCRAPER_STRATEGY',
          useValue: [],
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<ScraperService>(ScraperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
