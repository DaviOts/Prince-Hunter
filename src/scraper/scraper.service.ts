import { Injectable, Inject } from '@nestjs/common';
import {
  PriceResult,
  ScraperStrategy,
} from './strategies/scraper-strategy.interface';
import { CacheService } from 'src/cache/cache.service';
import { generateSlug } from 'src/common/utils';

@Injectable()
export class ScraperService {
  //inject all strategies
  constructor(
    @Inject('SCRAPER_STRATEGY') private readonly strategies: ScraperStrategy[],
    private readonly cacheService: CacheService,
  ) {}

  //travel each strategy and get price
  async scrapeAll(gameTitle: string): Promise<PriceResult[]> {
    const gameSlug = generateSlug(gameTitle);

    //check cache first before calling all strategies
    const results = await Promise.all(
      this.strategies.map(async (strategy) => {
        const cached = await this.cacheService.getPrices(
          strategy.storeSlug,
          gameSlug,
        );
        //cache hit: if prices found, return cached prices
        if (cached) {
          return cached;
        }
        //cache miss: call strategy
        const prices = await strategy.getPrice(gameTitle);
        //cache hit miss: if prices found, set cache
        if (prices.length > 0) {
          await this.cacheService.setPrices(
            strategy.storeSlug,
            gameSlug,
            prices,
            3600, //TTL 1h
          );
          return prices;
        }
        //cache miss: if not found, set cache with empty array
        return [];
      }),
    );

    //transform results in array with only one item -> [[steam], [gog, epic]] -> [steam, gog, epic]
    return results.flat();
  }
}
