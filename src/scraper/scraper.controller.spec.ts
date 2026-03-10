import { Test, TestingModule } from '@nestjs/testing';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { CacheService } from 'src/cache/cache.service';

describe('ScraperController', () => {
  let controller: ScraperController;

  const mockScraperService = {
    scrapeAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScraperController],
      providers: [
        {
          provide: ScraperService,
          useValue: mockScraperService,
        },
        {
          provide: 'SCRAPER_STRATEGY',
          useValue: [],
        },
        {
          provide: CacheService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ScraperController>(ScraperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
