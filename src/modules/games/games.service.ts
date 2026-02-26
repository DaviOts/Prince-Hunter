import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { generateSlug } from 'src/common/utils';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class GamesService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('scraper') private readonly scrapeQueue: Queue,
  ) {}

  //create game with provisional title and enqueue scraping job
  async create(createGameDto: CreateGameDto) {
    const slug = generateSlug(createGameDto.title);
    const game = await this.prisma.game.upsert({
      where: { slug },
      update: {},
      create: {
        title: createGameDto.title,
        slug,
      },
    });

    //enqueue job with gameId
    await this.scrapeQueue.add('scrape-prices', {
      gameTitle: createGameDto.title,
      gameId: game.id,
    });

    return { status: 'processing', game };
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

  async findBestPrice(slug: string) {
    const latestPrices = await this.prisma.price.findMany({
      where: {
        game: { slug },
      },
      distinct: ['storeId'],
      orderBy: { createdAt: 'desc' },
      include: {
        store: true,
      },
    });

    if (!latestPrices.length) {
      throw new NotFoundException('No prices found for this game');
    }

    const minValue = Math.min(
      ...latestPrices.map((price) => price.finalPrice.toNumber()),
    );

    const bestPrice = latestPrices.filter(
      (price) => price.finalPrice.toNumber() === minValue,
    );

    return bestPrice;
  }

  async findPriceHistory(slug: string) {
    const priceHistory = await this.prisma.price.findMany({
      where: {
        game: { slug },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        store: true,
      },
    });

    if (!priceHistory.length) {
      throw new NotFoundException('No prices found for this game');
    }

    return priceHistory;
  }

  async findCompare(slug: string) {
    const comparePrices = await this.prisma.price.findMany({
      where: {
        game: { slug },
      },
      distinct: ['storeId'],
      orderBy: { createdAt: 'desc' },
      include: {
        store: true,
      },
    });

    if (!comparePrices.length) {
      throw new NotFoundException('No prices found for this game');
    }

    return comparePrices;
  }

  async findLowest(slug: string) {
    const lowestPrice = await this.prisma.price.findFirst({
      where: {
        game: { slug },
      },
      orderBy: { finalPrice: 'asc' },
      include: {
        store: true,
      },
    });

    if (!lowestPrice) {
      throw new NotFoundException('No prices found for this game');
    }

    return lowestPrice;
  }
}
