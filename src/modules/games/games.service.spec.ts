import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/client';

describe('GamesService', () => {
  let service: GamesService;

  const mockPrisma = {
    game: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    price: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: getQueueToken('scraper'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should upsert game, enqueue scraping job, and return processing status', async () => {
      const game = { id: 'game-1', title: 'Elden Ring', slug: 'elden-ring' };
      mockPrisma.game.upsert.mockResolvedValue(game);
      mockQueue.add.mockResolvedValue(undefined);

      const result = await service.create({ title: 'Elden Ring' });

      expect(mockPrisma.game.upsert).toHaveBeenCalledWith({
        where: { slug: 'elden-ring' },
        update: {},
        create: { title: 'Elden Ring', slug: 'elden-ring' },
      });
      expect(mockQueue.add).toHaveBeenCalledWith('scrape-prices', {
        gameTitle: 'Elden Ring',
        gameId: 'game-1',
      });
      expect(result).toEqual({ status: 'processing', game });
    });
  });

  describe('findAll', () => {
    it('should return all games with latest price per store', async () => {
      const games = [{ id: 'g1', title: 'Elden Ring', prices: [] }];
      mockPrisma.game.findMany.mockResolvedValue(games);

      const result = await service.findAll();

      expect(mockPrisma.game.findMany).toHaveBeenCalledWith({
        include: {
          prices: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { store: true },
          },
        },
      });
      expect(result).toEqual(games);
    });
  });

  describe('findTitleGame', () => {
    it('should search games case-insensitively using contains', async () => {
      const games = [{ id: 'g1', title: 'Elden Ring' }];
      mockPrisma.game.findMany.mockResolvedValue(games);

      const result = await service.findTitleGame('elden');

      expect(mockPrisma.game.findMany).toHaveBeenCalledWith({
        where: {
          title: { contains: 'elden', mode: 'insensitive' },
        },
        include: {
          prices: {
            orderBy: { createdAt: 'desc' },
            include: { store: true },
          },
        },
      });
      expect(result).toEqual(games);
    });

    it('should return empty array when no games match', async () => {
      mockPrisma.game.findMany.mockResolvedValue([]);

      const result = await service.findTitleGame('nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('findBestPrice', () => {
    it('should throw NotFoundException when no prices exist', async () => {
      mockPrisma.price.findMany.mockResolvedValue([]);

      await expect(service.findBestPrice('elden-ring')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return all stores with the lowest price', async () => {
      const prices = [
        {
          id: 'p1',
          finalPrice: new Decimal(99.9),
          store: { slug: 'steam' },
        },
        {
          id: 'p2',
          finalPrice: new Decimal(99.9),
          store: { slug: 'gog' },
        },
        {
          id: 'p3',
          finalPrice: new Decimal(149.9),
          store: { slug: 'epic' },
        },
      ];
      mockPrisma.price.findMany.mockResolvedValue(prices);

      const result = await service.findBestPrice('elden-ring');

      expect(result).toHaveLength(2);
      expect(result).toEqual([prices[0], prices[1]]);
    });

    it('should return single store if only one has the lowest', async () => {
      const prices = [
        {
          id: 'p1',
          finalPrice: new Decimal(79.9),
          store: { slug: 'nuuvem' },
        },
        {
          id: 'p2',
          finalPrice: new Decimal(149.9),
          store: { slug: 'steam' },
        },
      ];
      mockPrisma.price.findMany.mockResolvedValue(prices);

      const result = await service.findBestPrice('hollow-knight');

      expect(result).toHaveLength(1);
      expect(result[0].store.slug).toBe('nuuvem');
    });
  });

  describe('findPriceHistory', () => {
    it('should throw NotFoundException when no history exists', async () => {
      mockPrisma.price.findMany.mockResolvedValue([]);

      await expect(service.findPriceHistory('elden-ring')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return prices ordered by createdAt asc', async () => {
      const history = [
        { id: 'p1', createdAt: new Date('2025-01-01') },
        { id: 'p2', createdAt: new Date('2025-06-01') },
      ];
      mockPrisma.price.findMany.mockResolvedValue(history);

      const result = await service.findPriceHistory('elden-ring');

      expect(mockPrisma.price.findMany).toHaveBeenCalledWith({
        where: { game: { slug: 'elden-ring' } },
        orderBy: { createdAt: 'asc' },
        include: { store: true },
      });
      expect(result).toEqual(history);
    });
  });

  describe('findCompare', () => {
    it('should throw NotFoundException when no prices exist', async () => {
      mockPrisma.price.findMany.mockResolvedValue([]);

      await expect(service.findCompare('elden-ring')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return distinct latest prices per store', async () => {
      const comparePrices = [
        { id: 'p1', storeId: 's1', store: { slug: 'steam' } },
        { id: 'p2', storeId: 's2', store: { slug: 'gog' } },
      ];
      mockPrisma.price.findMany.mockResolvedValue(comparePrices);

      const result = await service.findCompare('elden-ring');

      expect(mockPrisma.price.findMany).toHaveBeenCalledWith({
        where: { game: { slug: 'elden-ring' } },
        distinct: ['storeId'],
        orderBy: { createdAt: 'desc' },
        include: { store: true },
      });
      expect(result).toEqual(comparePrices);
    });
  });

  describe('findLowest', () => {
    it('should throw NotFoundException when no price exists', async () => {
      mockPrisma.price.findFirst.mockResolvedValue(null);

      await expect(service.findLowest('elden-ring')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return the all-time lowest price', async () => {
      const lowest = {
        id: 'p1',
        finalPrice: new Decimal(49.9),
        store: { slug: 'nuuvem' },
      };
      mockPrisma.price.findFirst.mockResolvedValue(lowest);

      const result = await service.findLowest('elden-ring');

      expect(mockPrisma.price.findFirst).toHaveBeenCalledWith({
        where: { game: { slug: 'elden-ring' } },
        orderBy: { finalPrice: 'asc' },
        include: { store: true },
      });
      expect(result).toEqual(lowest);
    });
  });
});
