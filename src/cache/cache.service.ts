import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/database/redis/redis.service';
import { PriceResult } from 'src/scraper/strategies/scraper-strategy.interface';

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  //get prices from cache
  async getPrices(
    storeSlug: string,
    gameSlug: string,
  ): Promise<PriceResult[] | null> {
    const cache = await this.redisService.get(generateKey(storeSlug, gameSlug));
    if (!cache) return null;
    return JSON.parse(cache) as PriceResult[];
  }

  //set prices in cache/redis
  async setPrices(
    storeSlug: string,
    gameSlug: string,
    prices: PriceResult[],
    ttl: number,
  ) {
    await this.redisService.set(
      generateKey(storeSlug, gameSlug),
      JSON.stringify(prices),
      ttl,
    );
  }
}

//generate key for strategy different stores
export function generateKey(storeSlug: string, gameSlug: string) {
  return `price:${storeSlug}:${gameSlug}`;
}

// generateKey('steam', 'elden-ring');

// generateKey('gog', 'elden-ring');

// generateKey('epic', 'elden-ring');

// generateKey('nuuvem', 'elden-ring');
