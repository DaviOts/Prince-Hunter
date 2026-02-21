export interface ScraperStrategy {
  readonly storeSlug: string; // steam, epic etc

  getPrice(gameTitle: string): Promise<PriceResult | null>;
}

export type PriceResult = {
  appId: number;
  finalPrice: number;
  initialPrice: number;
  discountPercent: number;
  storeSlug: string;
  url: string;
  canonicalTitle: string; //use to standardize title(slug, search etc)
};
