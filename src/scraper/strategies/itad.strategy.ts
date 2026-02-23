import { PriceResult, ScraperStrategy } from './scraper-strategy.interface';

interface ItadShopDeal {
  shop: { id: number; name: string };
  price: { amount: number };
  regular: { amount: number };
  cut: number;
  url: string;
}

interface ItadGamePrice {
  id: string;
  deals: ItadShopDeal[];
}

interface ItadSearchResult {
  id: string;
  title: string;
  slug: string;
  type: string; //game, bundle, dlc
}

const ITAD_SHOP_MAP: Record<number, string> = {
  16: 'epic',
  35: 'gog',
  50: 'nuuvem',
  2: '2game',
};
export class ItadStrategy implements ScraperStrategy {
  readonly storeSlug = 'itad';

  async getPrice(gameTitle: string): Promise<PriceResult[]> {
    try {
      //we search the game uuid ITAD
      const searchRes = await fetch(
        `https://api.isthereanydeal.com/games/search/v1?title=${encodeURIComponent(gameTitle)}&results=5&key=${process.env.ITAD_API_KEY}`,
      );
      const rawData = await searchRes.json();

      if (!searchRes.ok) return [];

      const searchData = rawData as ItadSearchResult[];
      const game = searchData.find((d) => d.type === 'game' || d.type === 'package');

      const gameUuid = game?.id;

      if (!gameUuid) return [];

      //get prices using uuid
      const shopIds = Object.keys(ITAD_SHOP_MAP).join(',');
      const pricesRes = await fetch(
        `https://api.isthereanydeal.com/games/prices/v3?country=BR&shops=${shopIds}&key=${process.env.ITAD_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([gameUuid]),
        },
      );
      const pricesData = (await pricesRes.json()) as ItadGamePrice[];

      const gameData = pricesData[0];

      if (!gameData?.deals?.length) return [];

      //map itad response to PriceResult
      return gameData.deals
        .map((deal) => {
          const storeSlug = ITAD_SHOP_MAP[deal.shop.id];
          if (!storeSlug) return null;
          return {
            appId: deal.shop.id,
            finalPrice: deal.price.amount,
            initialPrice: deal.regular.amount,
            discountPercent: deal.cut,
            storeSlug,
            url: deal.url,
            canonicalTitle: gameTitle,
          } satisfies PriceResult;
        })
        .filter((d): d is PriceResult => d !== null);
    } catch (error) {
      console.error('ITAD error:', error);
      return [];
    }
  }
}
