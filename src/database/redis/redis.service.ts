import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;

  onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
    });
    this.client.on('connect', () => {
      console.log('Redis connected');
    });
    this.client.on('error', (err) => {
      console.log('Redis error', err);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl: number) {
    return this.client.set(key, value, 'EX', ttl);
  }

  async del(key: string) {
    return this.client.del(key);
  }

  async sadd(key: string, value: string) {
    return this.client.sadd(key, value);
  }

  async smembers(key: string) {
    return this.client.smembers(key);
  }

  async expire(key: string, ttl: number) {
    return this.client.expire(key, ttl);
  }
}
