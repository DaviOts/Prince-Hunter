import {
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  Body,
} from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { CurrentUser } from 'src/auth/dto/guards/current-user.decorator';
import type { JwtPayload } from 'src/auth/interface/jwt-payload.interface';
import { UpdateWatchlistDto } from './dto/update-watchlist.dto';

@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Post(':gameSlug')
  async gameSlug(
    @Param('gameSlug') gameSlug: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return await this.watchlistService.addGameToWatchlist(gameSlug, user.sub);
  }

  @Get()
  async getWatchlist(@CurrentUser() user: JwtPayload) {
    return await this.watchlistService.getWatchlist(user.sub);
  }

  @Patch(':gameSlug')
  async updateWatchlist(
    @Param('gameSlug') gameSlug: string,
    @Body() dto: UpdateWatchlistDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return await this.watchlistService.updateWatchlist(
      gameSlug,
      user.sub,
      dto.status,
      dto.rating,
      dto.review,
    );
  }

  @Delete(':gameSlug')
  async removeGame(
    @Param('gameSlug') gameSlug: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return await this.watchlistService.removeGameFromWatchlist(
      gameSlug,
      user.sub,
    );
  }
}
