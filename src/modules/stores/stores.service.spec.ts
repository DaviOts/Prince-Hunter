import { Test, TestingModule } from '@nestjs/testing';
import { StoresService } from './stores.service';
import { PrismaService } from 'src/database/prisma/prisma.service';

describe('StoresService', () => {
  let service: StoresService;

  const mockPrismaService = {
    store: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
