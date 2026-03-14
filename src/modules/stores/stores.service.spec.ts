import { Test, TestingModule } from '@nestjs/testing';
import { StoresService } from './stores.service';
import { PrismaService } from 'src/database/prisma/prisma.service';

describe('StoresService', () => {
  let service: StoresService;

  const mockPrisma = {
    store: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all stores from database', async () => {
      const stores = [
        { id: 's1', name: 'Steam', slug: 'steam' },
        { id: 's2', name: 'GOG', slug: 'gog' },
      ];
      mockPrisma.store.findMany.mockResolvedValue(stores);

      const result = await service.findAll();

      expect(mockPrisma.store.findMany).toHaveBeenCalled();
      expect(result).toEqual(stores);
    });

    it('should return empty array when no stores exist', async () => {
      mockPrisma.store.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });
});
