import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('GamesController', () => {
  let controller: GamesController;

  const mockPrismaService = {
    game: { findMany: jest.fn() },
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        GamesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: getQueueToken('scraper'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    controller = module.get<GamesController>(GamesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
