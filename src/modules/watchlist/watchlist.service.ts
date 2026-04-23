import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Prisma, WatchlistStatus } from '@prisma/client';

@Injectable()
export class WatchlistService {
  constructor(private readonly prisma: PrismaService) {}
  async addGameToWatchlist(gameSlug: string, userId: string) {
    const game = await this.prisma.game.findUnique({
      where: { slug: gameSlug },
    });
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    try {
      const watchlist = await this.prisma.watchlist.create({
        data: {
          gameSlug,
          userId,
        },
      });
      return watchlist;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Game already in watchlist');
        }
      }
      throw error;
    }
  }

  async removeGameFromWatchlist(gameSlug: string, userId: string) {
    const game = await this.prisma.game.findUnique({
      where: { slug: gameSlug },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }
    try {
      const watchlist = await this.prisma.watchlist.delete({
        where: {
          userId_gameSlug: {
            userId,
            gameSlug,
          },
        },
      });
      return watchlist;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Game not found in watchlist');
        }
      }
      throw error;
    }
  }

  async getWatchlist(userId: string) {
    const watchlist = await this.prisma.watchlist.findMany({
      where: { userId },
      include: {
        game: {
          include: {
            prices: {
              orderBy: {
                finalPrice: 'asc',
              },
              take: 1,
            },
          },
        },
      },
    });
    return watchlist;
  }
  async updateWatchlist(
    gameSlug: string,
    userId: string,
    status?: WatchlistStatus,
    rating?: number,
    review?: string,
  ) {
    const game = await this.prisma.watchlist.update({
      where: {
        userId_gameSlug: {
          userId,
          gameSlug,
        },
      },
      data: {
        status,
        rating,
        review,
      },
    });
    return game;
  }
}
