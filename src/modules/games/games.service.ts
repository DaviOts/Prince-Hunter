import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { ScraperService } from 'src/scraper/scraper.service';

@Injectable()
export class GamesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scraperService: ScraperService,
  ) {}

  async create(createGameDto: CreateGameDto) {
    const game = await this.prisma.game.create({
      data: {
        title: createGameDto.title,
        slug: createGameDto.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/\s/g, '-')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .replaceAll(/[^a-z0-9-]/g, ''),
      },
    });

    const steamStore = await this.prisma.store.findUnique({
      where: { slug: 'steam' },
    });
    if (!steamStore) return game;

    const price = await this.scraperService.scrapeAll(createGameDto.title);
    if (!price) return game;

    const gamePrice = await this.prisma.price.create({
      data: {
        gameId: game.id,
        storeId: steamStore.id,
        url: `https://store.steampowered.com/app/${price.appId}`,
        finalPrice: price.finalPrice,
        originalPrice: price.initialPrice,
        discountPercent: price.discountPercent,
      },
    });
    return gamePrice;
  }

  async findAll() {
    return await this.prisma.game.findMany();
  }
}
