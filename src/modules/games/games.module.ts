import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { ScraperModule } from 'src/scraper/scraper.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [ScraperModule, DatabaseModule],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
