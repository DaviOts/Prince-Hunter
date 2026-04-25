import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistService } from './watchlist.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Prisma, WatchlistStatus } from '@prisma/client';
import { ConflictException } from '@nestjs/common';

describe('WatchlistService', () => {
  let service: WatchlistService;

  const mockPrisma = {
    game: {
      findUnique: jest.fn(),
    },
    watchlist: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchlistService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<WatchlistService>(WatchlistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add game to watchlist', async () => {
    const gameSlug = 'elden-ring';
    const userId = 'user-1';
    const watchlist = { id: 'w1', gameSlug, userId };
    mockPrisma.watchlist.create.mockResolvedValue(watchlist);
    mockPrisma.game.findUnique.mockResolvedValue({
      id: 'g1',
      slug: 'elden-ring',
    });
    const result = await service.addGameToWatchlist(gameSlug, userId);
    expect(mockPrisma.watchlist.create).toHaveBeenCalledWith({
      data: { gameSlug, userId },
    });
    expect(result).toEqual(watchlist);
  });

  it('should throw ConflictException when game is already in watchlist', async () => {
    const gameSlug = 'elden-ring';
    const userId = 'user-1';
    const error = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint violation',
      {
        code: 'P2002',
        clientVersion: '0.0.0',
      },
    );
    mockPrisma.game.findUnique.mockResolvedValue({
      id: 'g1',
      slug: 'elden-ring',
    });
    mockPrisma.watchlist.create.mockRejectedValue(error);
    await expect(service.addGameToWatchlist(gameSlug, userId)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should update game in watchlist', async () => {
    const gameSlug = 'elden-ring';
    const userId = 'user-1';
    const dto = {
      status: WatchlistStatus.PLAYING,
      rating: 5,
      review: 'amazinggggggg bro',
    };
    const updatedWatchlist = {
      id: 'w1',
      gameSlug,
      userId,
      status: WatchlistStatus.PLAYING,
    };
    mockPrisma.watchlist.update.mockResolvedValue(updatedWatchlist);
    const result = await service.updateWatchlist(
      gameSlug,
      userId,
      dto.status,
      dto.rating,
      dto.review,
    );
    expect(mockPrisma.watchlist.update).toHaveBeenCalledWith({
      where: { userId_gameSlug: { userId, gameSlug } },
      data: {
        status: dto.status,
        rating: dto.rating,
        review: dto.review,
      },
    });
    expect(result).toEqual(updatedWatchlist);
  });

  it('should remove game from watchlist', async () => {
    const gameSlug = 'elden-ring';
    const userId = 'user-1';
    const watchlist = { id: 'w1', gameSlug, userId };
    mockPrisma.game.findUnique.mockResolvedValue({
      id: 'g1',
      slug: 'elden-ring',
    });
    mockPrisma.watchlist.delete.mockResolvedValue(watchlist);
    const result = await service.removeGameFromWatchlist(gameSlug, userId);
    expect(mockPrisma.watchlist.delete).toHaveBeenCalledWith({
      where: { userId_gameSlug: { userId, gameSlug } },
    });
    expect(result).toEqual(watchlist);
  });
});
