import { Injectable, Inject } from '@nestjs/common';
import {
  PriceResult,
  ScraperStrategy,
} from './strategies/scraper-strategy.interface';

@Injectable()
export class ScraperService {
  //inject all strategies
  constructor(
    @Inject('SCRAPER_STRATEGY') private readonly strategies: ScraperStrategy[],
  ) {}
  //travel each strategy and get price
  async scrapeAll(gameTitle: string): Promise<PriceResult[]> {
    const results = await Promise.all(
      this.strategies.map((strategy) => strategy.getPrice(gameTitle)),
    );

    //filter null values, travel each array and check if element is null
    return results.filter((price): price is PriceResult => price !== null);
  }
}
