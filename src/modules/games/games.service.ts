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

  async findBestPrice(slug: string) {
    const lastestPrices = await this.prisma.price.findMany({
      where: {
        game: { slug },
      },
      distinct: ['storeId'],
      orderBy: { createdAt: 'desc' },
      include: {
        store: true,
      },
    });

    if (!lastestPrices.length) {
      throw new NotFoundException('No prices found for this game');
    }

    const bestPrice = lastestPrices.reduce((min, current) => {
      return current.finalPrice.toNumber() < min.finalPrice.toNumber()
        ? current
        : min;
    });

    return bestPrice;
  }

  async findPriceHistory(slug: string) {
    const lastestPrices = await this.prisma.price.findMany({
      where: {
        game: { slug },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        store: true,
      },
    });

    if (!lastestPrices.length) {
      throw new NotFoundException('No prices found for this game');
    }

    return lastestPrices;
  }

  async findCompare(slug: string) {
    const lastestPrices = await this.prisma.price.findMany({
      where: {
        game: { slug },
      },
      distinct: ['storeId'],
      orderBy: { createdAt: 'desc' },
      include: {
        store: true,
      },
    });

    if (!lastestPrices.length) {
      throw new NotFoundException('No prices found for this game');
    }

    return lastestPrices;
  }

  async findLowest(slug: string) {
    return [];
  }
}
