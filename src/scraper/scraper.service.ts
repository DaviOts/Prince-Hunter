import { Injectable } from '@nestjs/common';

@Injectable()
export class ScraperService {
  async findSteamAppId(gameTitle: string): Promise<number | null> {
    try {
      const url = `https://store.steampowered.com/api/storesearch/?term=${gameTitle}&l=english&cc=BR`;
      const response = await fetch(url);
      const data = await response.json();
      return data.items[0].id;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async getPriceBySteamAppId(gameId: number): Promise<{
    finalPrice: number;
    initialPrice: number;
    discountPercent: number;
  } | null> {
    try {
      const url = `https://store.steampowered.com/api/appdetails?appids=${gameId}&cc=BR&filters=price_overview`;
      const response = await fetch(url);
      const data = await response.json();
      return {
        finalPrice: data[gameId].data.price_overview.final / 100,
        initialPrice: data[gameId].data.price_overview.initial / 100,
        discountPercent: data[gameId].data.price_overview.discount_percent,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async scrapeAll(gameTitle: string): Promise<{
    appId: number;
    finalPrice: number;
    initialPrice: number;
    discountPercent: number;
  } | null> {
    const appId = await this.findSteamAppId(gameTitle);
    if (!appId) return null;
    const price = await this.getPriceBySteamAppId(appId);
    if (!price) return null;
    return { appId, ...price };
  }
}
