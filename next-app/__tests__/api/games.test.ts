import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/games/[dateCode]/route';

vi.mock('@/app/actions/matchups', () => ({
  getGamesByCodePrefix: vi.fn(),
}));

const mockGetGamesByCodePrefix = vi.mocked(
  (await import('@/app/actions/matchups')).getGamesByCodePrefix
);

describe('GET /api/games/[dateCode]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns games for a valid dateCode', async () => {
    const mockGames = [
      {
        matchup: {
          id: 'abc123def456ghi',
          code: '20250101/LALBOS',
          time_utc: '2025-01-01T19:30:00Z',
          home_code: 'BOS',
          away_code: 'LAL',
          home_meta: { wins: 20, losses: 10 },
          away_meta: { wins: 18, losses: 12 },
          scoreboard: '',
          created: '2024-12-01T00:00:00Z',
          updated: '2024-12-01T00:00:00Z',
        },
        picks: [],
      },
    ];

    mockGetGamesByCodePrefix.mockResolvedValue(mockGames);

    const params = Promise.resolve({ dateCode: '20250101' });
    const response = await GET(new Request('http://localhost'), { params });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.games).toEqual(mockGames);
  });

  it('returns empty array when no games exist for dateCode', async () => {
    mockGetGamesByCodePrefix.mockResolvedValue([]);

    const params = Promise.resolve({ dateCode: '20250101' });
    const response = await GET(new Request('http://localhost'), { params });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.games).toEqual([]);
  });

  it('returns 400 for invalid dateCode format', async () => {
    mockGetGamesByCodePrefix.mockRejectedValue(
      new Error('Invalid date code format')
    );

    const params = Promise.resolve({ dateCode: 'invalid' });

    await expect(
      GET(new Request('http://localhost'), { params })
    ).rejects.toThrow('Invalid date code format');
  });
});
