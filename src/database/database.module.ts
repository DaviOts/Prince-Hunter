import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisModule } from './redis/redis.module';

@Global()
@Module({
  imports: [RedisModule],
  providers: [PrismaService],
  exports: [PrismaService, RedisModule],
})
export class DatabaseModule {}
