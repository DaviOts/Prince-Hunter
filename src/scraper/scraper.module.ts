import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { SteamStrategy } from './strategies/steam.strategy';
import { ItadStrategy } from './strategies/itad.strategy';
import { CacheModule } from 'src/cache/cache.module';
import { BullModule } from '@nestjs/bullmq';
import { ScraperProcessor } from './scraper.processor';

@Module({
  imports: [
    CacheModule,
    BullModule.registerQueue({
      name: 'scraper',
    }),
  ],
  controllers: [ScraperController],
  providers: [
    ScraperService,
    SteamStrategy,
    ItadStrategy,
    ScraperProcessor,
    {
      provide: 'SCRAPER_STRATEGY', //TOKEN to inject all strategies
      useFactory: (steam: SteamStrategy, itad: ItadStrategy) => [steam, itad],
      inject: [SteamStrategy, ItadStrategy],
    },
  ],
  exports: [ScraperService, BullModule],
})
export class ScraperModule {}
