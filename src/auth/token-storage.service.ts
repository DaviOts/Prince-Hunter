import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/database/redis/redis.service';
import * as crypto from 'crypto';

@Injectable()
export class TokenStorageService {
  constructor(private readonly redisService: RedisService) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const storedHashToken = this.hashToken(refreshToken);
    await this.redisService.set(
      `auth_rt:${storedHashToken}`,
      userId,
      60 * 60 * 24 * 7,
    );

    await this.redisService.sadd(`x_user_sessions:${userId}`, storedHashToken);
    await this.redisService.expire(
      `x_user_sessions:${userId}`,
      60 * 60 * 24 * 7,
    );
  }

  async validateToken(userId: string, refreshToken: string): Promise<boolean> {
    const hashKey = this.hashToken(refreshToken);

    const storedUserId = await this.redisService.get(`auth_rt:${hashKey}`);

    return storedUserId === userId;
  }

  async invaliteAllUserTokens(userId: string): Promise<void> {
    const tokens = await this.redisService.smembers(
      `x_user_sessions:${userId}`,
    );
    for (const token of tokens) {
      await this.redisService.del(`auth_rt:${token}`);
    }
    await this.redisService.del(`x_user_sessions:${userId}`);
  }
}
