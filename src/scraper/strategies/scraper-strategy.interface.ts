export type PriceResult = {
  appId: number;
  finalPrice: number;
  initialPrice: number;
  discountPercent: number;
  storeSlug: string;
  url: string;
  canonicalTitle: string; //use to standardize title(slug, search etc)
};

//make a interface to all strategies(steam, gog, epic etc)
export interface ScraperStrategy {
  getPrice(gameTitle: string): Promise<PriceResult[]>; //return array with 1 item or empty array
  storeSlug: string;
}
