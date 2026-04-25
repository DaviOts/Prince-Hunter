import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';
import { WatchlistStatus } from '@prisma/client';

describe('WatchlistController', () => {
  let controller: WatchlistController;

  const mockWatchlistService = {
    addGameToWatchlist: jest.fn(),
    removeGameFromWatchlist: jest.fn(),
    getWatchlist: jest.fn(),
    updateWatchlist: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchlistController],
      providers: [
        {
          provide: WatchlistService,
          useValue: mockWatchlistService,
        },
      ],
    }).compile();

    controller = module.get<WatchlistController>(WatchlistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should add game to watchlist', async () => {
    const gameSlug = 'elden-ring';
    const user = { sub: 'user-1', email: 'a@a.com', iat: 0, exp: 0 };
    mockWatchlistService.addGameToWatchlist.mockReturnValue({});
    await controller.gameSlug(gameSlug, user);
    expect(mockWatchlistService.addGameToWatchlist).toHaveBeenCalledWith(
      gameSlug,
      user.sub,
    );
  });

  it('should get watchlist', async () => {
    const user = { sub: 'user-1', email: 'a@a.com', iat: 0, exp: 0 };
    mockWatchlistService.getWatchlist.mockReturnValue({});
    await controller.getWatchlist(user);
    expect(mockWatchlistService.getWatchlist).toHaveBeenCalledWith(user.sub);
  });

  it('should update watchlist', async () => {
    const gameSlug = 'elden-ring';
    const user = { sub: 'user-1', email: 'a@a.com', iat: 0, exp: 0 };
    const dto = {
      status: WatchlistStatus.PLAYING,
      rating: 10,
      review: 'WOWW badass',
    };
    mockWatchlistService.updateWatchlist.mockReturnValue({});
    await controller.updateWatchlist(gameSlug, dto, user);
    expect(mockWatchlistService.updateWatchlist).toHaveBeenCalledWith(
      gameSlug,
      user.sub,
      dto.status,
      dto.rating,
      dto.review,
    );
  });

  it('should remove game from watchlist', async () => {
    const gameSlug = 'elden-ring';
    const user = { sub: 'user-1', email: 'a@a.com', iat: 0, exp: 0 };
    mockWatchlistService.removeGameFromWatchlist.mockReturnValue({});
    await controller.removeGame(gameSlug, user);
    expect(mockWatchlistService.removeGameFromWatchlist).toHaveBeenCalledWith(
      gameSlug,
      user.sub,
    );
  });
});
