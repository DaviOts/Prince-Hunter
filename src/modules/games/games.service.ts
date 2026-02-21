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

  //create game and standardize title and slug
  async create(createGameDto: CreateGameDto) {
    const prices = await this.scraperService.scrapeAll(createGameDto.title);

    const canonicalTitle = prices[0]?.canonicalTitle ?? createGameDto.title;
    const slug = canonicalTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/\s/g, '-')
      .replace(/[^\u0000-\u007F]/g, '')
      .trim()
      .replaceAll(/[^a-z0-9-]/g, '');

    const game = await this.prisma.game.upsert({
      where: { slug: slug },
      update: {},
      create: {
        title: canonicalTitle,
        slug: slug,
      },
    });

    if (!prices.length) return game;
    //map all data(in all stores) and save it in database
    const gamePrice = await Promise.all(
      prices.map(async (price) => {
        const store = await this.prisma.store.findUnique({
          where: { slug: price.storeSlug },
        });
        if (!store) return null;
        const lastPrice = await this.prisma.price.findFirst({
          where: {
            gameId: game.id,
            storeId: store.id,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        if (lastPrice && lastPrice.finalPrice.toNumber() === price.finalPrice)
          return lastPrice;

        return this.prisma.price.create({
          data: {
            gameId: game.id,
            storeId: store.id,
            url: price.url,
            finalPrice: price.finalPrice,
            originalPrice: price.initialPrice,
            discountPercent: price.discountPercent,
          },
        });
      }),
    );
    return { game, price: gamePrice.filter(Boolean) };
  }

  //find all games and their prices with store name
  findAll() {
    return this.prisma.game.findMany({
      include: {
        prices: {
          include: {
            store: true,
          },
        },
      },
    });
  }
}
