import { PriceResult, ScraperStrategy } from './scraper-strategy.interface';
import { env } from 'process';

export class ItadStrategy implements ScraperStrategy {
  readonly storeSlug = 'itad';
  async getPrice(gameTitle: string): Promise<PriceResult[]> {
    try {
      const url = `https://api.isthereanydeal.com/v01/game/prices/?key=${env.ITAD_API_KEY}&plains=${gameTitle}&region=br`;
      const response = await fetch(url);
      const data = await response.json();
      return data.data.list.map((item: any) => ({
        appId: item.id,
        finalPrice: item.price,
        initialPrice: item.originalPrice,
        discountPercent: item.discountPercent,
        storeSlug: this.storeSlug,
        url: item.url,
        canonicalTitle: item.title,
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
