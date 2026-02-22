import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { ScraperService } from 'src/scraper/scraper.service';
import { generateSlug } from 'src/common/utils';

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
    const slug = generateSlug(canonicalTitle);

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
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            store: true,
          },
        },
      },
    });
  }

  //find game by slug and return all prices
  async findOne(slug: string) {
    const gameWithPrices = await this.prisma.game.findUnique({
      where: { slug: slug },
      include: {
        prices: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            store: true,
          },
        },
      },
    });
    return gameWithPrices;
  }

  //find game by title
  async findTitleGame(search: string) {
    const game = await this.prisma.game.findMany({
      where: {
        title: {
          contains: search,
          mode: 'insensitive',
        },
      },
      include: {
        prices: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            store: true,
          },
        },
      },
    });
    return game;
  }
}
