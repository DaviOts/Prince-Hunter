import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('GamesService', () => {
  let service: GamesService;

  const mockPrismaService = {
    game: {
      upsert: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    price: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
    },
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<GamesService>(GamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
