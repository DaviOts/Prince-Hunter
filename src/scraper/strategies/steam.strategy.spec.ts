import { SteamStrategy } from './steam.strategy';

describe('SteamStrategy', () => {
  let strategy: SteamStrategy;

  beforeEach(() => {
    strategy = new SteamStrategy();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should have storeSlug set to steam', () => {
    expect(strategy.storeSlug).toBe('steam');
  });

  it('should return price when search and details both succeed', async () => {
    const searchResponse = {
      items: [{ id: 1245620, name: 'ELDEN RING' }],
    };
    const detailsResponse = {
      '1245620': {
        success: true,
        data: {
          price_overview: {
            final: 19990,
            initial: 24990,
            discount_percent: 20,
            currency: 'BRL',
          },
        },
      },
    };

    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        json: () => Promise.resolve(searchResponse),
      } as Response)
      .mockResolvedValueOnce({
        json: () => Promise.resolve(detailsResponse),
      } as Response);

    const result = await strategy.getPrice('elden ring');

    expect(result).toHaveLength(1);
    expect(result[0].finalPrice).toBe(199.9);
    expect(result[0].initialPrice).toBe(249.9);
    expect(result[0].discountPercent).toBe(20);
    expect(result[0].storeSlug).toBe('steam');
    expect(result[0].canonicalTitle).toBe('ELDEN RING');
    expect(result[0].url).toContain('1245620');
  });

  it('should return empty array when no items found', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: () => Promise.resolve({ items: [] }),
    } as Response);

    const result = await strategy.getPrice('nonexistent_game_xyz');

    expect(result).toEqual([]);
  });

  it('should return empty array when items is undefined', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: () => Promise.resolve({}),
    } as Response);

    const result = await strategy.getPrice('broken-response');

    expect(result).toEqual([]);
  });

  it('should return empty array when details API returns no price_overview', async () => {
    const searchResponse = {
      items: [{ id: 999, name: 'Free Game' }],
    };
    const detailsResponse = {
      '999': {
        success: true,
        data: {},
      },
    };

    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        json: () => Promise.resolve(searchResponse),
      } as Response)
      .mockResolvedValueOnce({
        json: () => Promise.resolve(detailsResponse),
      } as Response);

    const result = await strategy.getPrice('free game');

    expect(result).toEqual([]);
  });

  it('should return empty array when details API returns success: false', async () => {
    const searchResponse = {
      items: [{ id: 999, name: 'Broken Game' }],
    };
    const detailsResponse = {
      '999': { success: false },
    };

    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        json: () => Promise.resolve(searchResponse),
      } as Response)
      .mockResolvedValueOnce({
        json: () => Promise.resolve(detailsResponse),
      } as Response);

    const result = await strategy.getPrice('broken game');

    expect(result).toEqual([]);
  });

  it('should return empty array when fetch throws network error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    jest
      .spyOn(global, 'fetch')
      .mockRejectedValueOnce(new Error('Network timeout'));

    const result = await strategy.getPrice('elden ring');

    expect(result).toEqual([]);
  });
});
