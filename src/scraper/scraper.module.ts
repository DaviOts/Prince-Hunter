import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { SteamStrategy } from './strategies/steam.strategy';

@Module({
  controllers: [ScraperController],
  providers: [
    ScraperService,
    SteamStrategy,
    {
      provide: 'SCRAPER_STRATEGY',
      useFactory: (steam: SteamStrategy) => [steam],
      inject: [SteamStrategy],
    },
  ],
  exports: [ScraperService],
})
export class ScraperModule {}
