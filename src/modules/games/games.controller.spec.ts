import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';

describe('GamesController', () => {
  let controller: GamesController;

  const mockGamesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findTitleGame: jest.fn(),
    findBestPrice: jest.fn(),
    findPriceHistory: jest.fn(),
    findCompare: jest.fn(),
    findLowest: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [{ provide: GamesService, useValue: mockGamesService }],
    }).compile();

    controller = module.get<GamesController>(GamesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to gamesService.create', () => {
      const dto: CreateGameDto = { title: 'Elden Ring' };
      mockGamesService.create.mockReturnValue({ status: 'processing' });

      const result = controller.create(dto);

      expect(mockGamesService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ status: 'processing' });
    });
  });

  describe('findAll', () => {
    it('should call findTitleGame when search query is provided', () => {
      const games = [{ title: 'Elden Ring' }];
      mockGamesService.findTitleGame.mockReturnValue(games);

      const result = controller.findAll('elden');

      expect(mockGamesService.findTitleGame).toHaveBeenCalledWith('elden');
      expect(mockGamesService.findAll).not.toHaveBeenCalled();
      expect(result).toEqual(games);
    });

    it('should call findAll when no search query', () => {
      const games = [{ title: 'All Games' }];
      mockGamesService.findAll.mockReturnValue(games);

      const result = controller.findAll(undefined);

      expect(mockGamesService.findAll).toHaveBeenCalled();
      expect(mockGamesService.findTitleGame).not.toHaveBeenCalled();
      expect(result).toEqual(games);
    });
  });

  describe('findBestPrice', () => {
    it('should delegate to gamesService.findBestPrice with slug', async () => {
      mockGamesService.findBestPrice.mockReturnValue([]);
      await controller.findBestPrice('elden-ring');
      expect(mockGamesService.findBestPrice).toHaveBeenCalledWith('elden-ring');
    });
  });

  describe('findPriceHistory', () => {
    it('should delegate to gamesService.findPriceHistory with slug', async () => {
      mockGamesService.findPriceHistory.mockReturnValue([]);
      await controller.findPriceHistory('elden-ring');
      expect(mockGamesService.findPriceHistory).toHaveBeenCalledWith(
        'elden-ring',
      );
    });
  });

  describe('findCompare', () => {
    it('should delegate to gamesService.findCompare with slug', async () => {
      mockGamesService.findCompare.mockReturnValue([]);
      await controller.findCompare('elden-ring');
      expect(mockGamesService.findCompare).toHaveBeenCalledWith('elden-ring');
    });
  });

  describe('findLowest', () => {
    it('should delegate to gamesService.findLowest with slug', async () => {
      mockGamesService.findLowest.mockReturnValue({});
      await controller.findLowest('elden-ring');
      expect(mockGamesService.findLowest).toHaveBeenCalledWith('elden-ring');
    });
  });
});
