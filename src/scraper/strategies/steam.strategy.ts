import { PriceResult, ScraperStrategy } from './scraper-strategy.interface';

interface SteamSearchResponse {
  items: Array<{
    id: number;
    name: string;
  }>;
}

interface SteamAppDetailsResponse {
  [key: string]: {
    success: boolean;
    data: {
      price_overview: {
        final: number;
        initial: number;
        discount_percent: number;
        currency: string;
      };
    };
  };
}

export class SteamStrategy implements ScraperStrategy {
  readonly storeSlug = 'steam';

  //search game in steam and get price
  async getPrice(gameTitle: string): Promise<PriceResult[]> {
    try {
      const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(
        gameTitle,
      )}&l=english&cc=BR`;
      const response = await fetch(url);
      const data = (await response.json()) as SteamSearchResponse;

      if (!data.items || data.items.length === 0) return [];

      const price = await this.getPriceBySteamAppId(
        data.items[0].id,
        data.items[0].name,
      );
      return price ? [price] : []; //wrap in array or return empty
    } catch (error) {
      console.error('Steam search error:', error);
      return [];
    }
  }

  //get price by steam app id
  async getPriceBySteamAppId(
    gameId: number,
    canonicalTitle: string,
  ): Promise<PriceResult | null> {
    try {
      const url = `https://store.steampowered.com/api/appdetails?appids=${gameId}&cc=BR&filters=price_overview`;
      const response = await fetch(url);
      const data = (await response.json()) as SteamAppDetailsResponse;

      if (!data[gameId]?.success || !data[gameId].data.price_overview) {
        return null;
      }

      const priceInfo = data[gameId].data.price_overview;

      return {
        appId: gameId,
        finalPrice: priceInfo.final / 100,
        initialPrice: priceInfo.initial / 100,
        discountPercent: priceInfo.discount_percent,
        storeSlug: this.storeSlug,
        url: `https://store.steampowered.com/app/${gameId}`,
        canonicalTitle,
      };
    } catch (error) {
      console.error('Steam details error:', error);
      return null;
    }
  }
}
