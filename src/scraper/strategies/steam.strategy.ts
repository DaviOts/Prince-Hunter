import { PriceResult, ScraperStrategy } from './scraper-strategy.interface';

export class SteamStrategy implements ScraperStrategy {
  readonly storeSlug = 'steam';

  async getPrice(gameTitle: string): Promise<PriceResult | null> {
    try {
      const url = `https://store.steampowered.com/api/storesearch/?term=${gameTitle}&l=english&cc=BR`;
      const response = await fetch(url);
      const data = await response.json();
      return await this.getPriceBySteamAppId(data.items[0].id);
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async getPriceBySteamAppId(gameId: number): Promise<PriceResult | null> {
    try {
      const url = `https://store.steampowered.com/api/appdetails?appids=${gameId}&cc=BR&filters=price_overview`;
      const response = await fetch(url);
      const data = await response.json();
      return {
        appId: gameId,
        finalPrice: data[gameId].data.price_overview.final / 100,
        initialPrice: data[gameId].data.price_overview.initial / 100,
        discountPercent: data[gameId].data.price_overview.discount_percent,
        storeSlug: this.storeSlug,
        url: `https://store.steampowered.com/app/${gameId}`,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
