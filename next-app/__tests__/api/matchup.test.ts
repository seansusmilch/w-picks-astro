import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/matchup/[dateCode]/[gameCode]/route';

vi.mock('@/app/actions/matchups', () => ({
  getMatchupPageData: vi.fn(),
}));

const mockGetMatchupPageData = vi.mocked(
  (await import('@/app/actions/matchups')).getMatchupPageData
);

describe('GET /api/matchup/[dateCode]/[gameCode]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns matchup data for valid params', async () => {
    const mockMatchupData = {
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
      scoreboard: null,
      picks: [],
    };

    mockGetMatchupPageData.mockResolvedValue(mockMatchupData);

    const params = Promise.resolve({ dateCode: '20250101', gameCode: 'LALBOS' });
    const response = await GET(new Request('http://localhost'), { params });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual(mockMatchupData);
    expect(mockGetMatchupPageData).toHaveBeenCalledWith('20250101/LALBOS');
  });

  it('returns 404 when matchup not found', async () => {
    mockGetMatchupPageData.mockResolvedValue(null);

    const params = Promise.resolve({ dateCode: '20250101', gameCode: 'NOTFOUND' });
    const response = await GET(new Request('http://localhost'), { params });

    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe('Not found');
  });

  it('returns 404 for invalid gameCode', async () => {
    mockGetMatchupPageData.mockResolvedValue(null);

    const params = Promise.resolve({ dateCode: '20250101', gameCode: '' });
    const response = await GET(new Request('http://localhost'), { params });

    expect(response.status).toBe(404);
  });
});
