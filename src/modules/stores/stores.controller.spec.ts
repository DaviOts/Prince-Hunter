import { Test, TestingModule } from '@nestjs/testing';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';

describe('StoresController', () => {
  let controller: StoresController;

  const mockStoresService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoresController],
      providers: [{ provide: StoresService, useValue: mockStoresService }],
    }).compile();

    controller = module.get<StoresController>(StoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to storesService.findAll', async () => {
      const stores = [{ id: 's1', name: 'Steam', slug: 'steam' }];
      mockStoresService.findAll.mockResolvedValue(stores);

      const result = await controller.findAll();

      expect(mockStoresService.findAll).toHaveBeenCalled();
      expect(result).toEqual(stores);
    });
  });
});
