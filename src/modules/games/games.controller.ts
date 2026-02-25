import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @HttpCode(HttpStatus.ACCEPTED)
  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  @Get() //one route, if has query search for game by title, else return all games
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search for a game by title',
  })
  findAll(@Query('search') search?: string) {
    if (search) return this.gamesService.findTitleGame(search);
    return this.gamesService.findAll();
  }

  @Get(':slug/best-price')
  findBestPrice(@Param('slug') slug: string) {
    return this.gamesService.findBestPrice(slug);
  }

  @Get(':slug/price-history')
  findPriceHistory(@Param('slug') slug: string) {
    return this.gamesService.findPriceHistory(slug);
  }

  @Get(':slug/compare')
  findCompare(@Param('slug') slug: string) {
    return this.gamesService.findCompare(slug);
  }

  @Get(':slug/lowest')
  findLowest(@Param('slug') slug: string) {
    return this.gamesService.findLowest(slug);
  }
}
