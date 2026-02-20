import { Controller, Get, Param } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get(':gameTitle')
  scrapeByTitle(@Param('gameTitle') gameTitle: string) {
    return this.scraperService.scrapeAll(gameTitle);
  }
}
