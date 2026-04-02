import { ItadStrategy } from './itad.strategy';

describe('ItadStrategy', () => {
  let strategy: ItadStrategy;

  beforeEach(() => {
    strategy = new ItadStrategy();
    process.env.ITAD_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.ITAD_API_KEY;
  });

  it('should have storeSlug set to itad', () => {
    expect(strategy.storeSlug).toBe('itad');
  });

  it('should return mapped prices from known shops', async () => {
    const searchData = [
      {
        id: 'uuid-game-1',
        title: 'Elden Ring',
        slug: 'elden-ring',
        type: 'game',
      },
    ];
    const pricesData = [
      {
        id: 'uuid-game-1',
        deals: [
          {
            shop: { id: 16, name: 'Epic Game Store' },
            price: { amount: 149.9 },
            regular: { amount: 249.9 },
            cut: 40,
            url: 'https://epic.com/elden-ring',
          },
          {
            shop: { id: 35, name: 'GOG.com' },
            price: { amount: 189.9 },
            regular: { amount: 249.9 },
            cut: 24,
            url: 'https://gog.com/elden-ring',
          },
        ],
      },
    ];

    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(searchData),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(pricesData),
      } as Response);

    const result = await strategy.getPrice('Elden Ring');

    expect(result).toHaveLength(2);
    expect(result[0].storeSlug).toBe('epic');
    expect(result[0].finalPrice).toBe(149.9);
    expect(result[1].storeSlug).toBe('gog');
    expect(result[1].finalPrice).toBe(189.9);
  });

  it('should filter out unmapped shop ids', async () => {
    const searchData = [
      { id: 'uuid-1', title: 'Game', slug: 'game', type: 'game' },
    ];
    const pricesData = [
      {
        id: 'uuid-1',
        deals: [
          {
            shop: { id: 9999, name: 'Unknown Store' },
            price: { amount: 99.9 },
            regular: { amount: 99.9 },
            cut: 0,
            url: 'https://unknown.com',
          },
        ],
      },
    ];

    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(searchData),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(pricesData),
      } as Response);

    const result = await strategy.getPrice('Game');

    expect(result).toEqual([]);
  });

  it('should return empty array when search finds no game type', async () => {
    const searchData = [
      { id: 'uuid-dlc', title: 'DLC Pack', slug: 'dlc-pack', type: 'dlc' },
    ];

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(searchData),
    } as Response);

    const result = await strategy.getPrice('DLC Pack');

    expect(result).toEqual([]);
  });

  it('should return empty array when search response is not ok', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
    } as Response);

    const result = await strategy.getPrice('Elden Ring');

    expect(result).toEqual([]);
  });

  it('should return empty array when prices response is not ok', async () => {
    const searchData = [
      { id: 'uuid-1', title: 'Game', slug: 'game', type: 'game' },
    ];

    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(searchData),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
      } as Response);

    const result = await strategy.getPrice('Game');

    expect(result).toEqual([]);
  });

  it('should return empty array when deals is empty', async () => {
    const searchData = [
      { id: 'uuid-1', title: 'Game', slug: 'game', type: 'game' },
    ];
    const pricesData = [{ id: 'uuid-1', deals: [] }];

    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(searchData),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(pricesData),
      } as Response);

    const result = await strategy.getPrice('Game');

    expect(result).toEqual([]);
  });

  it('should return empty array when fetch throws', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest
      .spyOn(global, 'fetch')
      .mockRejectedValueOnce(new Error('Network error'));

    const result = await strategy.getPrice('Elden Ring');

    expect(result).toEqual([]);
  });
});
