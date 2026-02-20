import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database/database.module';
import { GamesModule } from './modules/games/games.module';
import { StoresModule } from './modules/stores/stores.module';
import { ScraperModule } from './scraper/scraper.module';

@Module({
  imports: [DatabaseModule, GamesModule, StoresModule, ScraperModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
