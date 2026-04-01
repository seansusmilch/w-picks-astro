import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/scoreboard/route';

vi.mock('@/lib/nba', () => ({
  fetchNBAScoreboardsEndpoint: vi.fn(),
}));

vi.mock('@/lib/nba-scoreboard-utils', () => ({
  transformNBAGamesToScoreboards: vi.fn(),
  findScoreboardByCode: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  getLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

const mockFetchNBAScoreboardsEndpoint = vi.mocked(
  (await import('@/lib/nba')).fetchNBAScoreboardsEndpoint
);
const mockTransformNBAGamesToScoreboards = vi.mocked(
  (await import('@/lib/nba-scoreboard-utils')).transformNBAGamesToScoreboards
);
const mockFindScoreboardByCode = vi.mocked(
  (await import('@/lib/nba-scoreboard-utils')).findScoreboardByCode
);

function createMockRequest(searchParams: Record<string, string> = {}) {
  const params = new URLSearchParams(searchParams);
  return {
    nextUrl: { searchParams: params },
  } as unknown as NextRequest;
}

describe('GET /api/scoreboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 200 with scoreboard data when games exist', async () => {
    const mockGames = [
      { gameCode: '20250101/LALBOS', gameStatus: 1 },
    ];
    const mockScoreboards = [
      { code: '20250101/LALBOS', status: 1, status_text: '7:30 PM ET', home_score: 0, away_score: 0 },
    ];

    mockFetchNBAScoreboardsEndpoint.mockResolvedValue({
      scoreboard: { games: mockGames },
    });
    mockTransformNBAGamesToScoreboards.mockReturnValue(mockScoreboards);

    const request = createMockRequest();
    const response = await GET(request);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual(mockScoreboards);
  });

  it('returns 200 with single scoreboard when code param is provided', async () => {
    const mockGames = [{ gameCode: '20250101/LALBOS', gameStatus: 2 }];
    const mockScoreboards = [
      { code: '20250101/LALBOS', status: 2, status_text: 'Live', home_score: 98, away_score: 102 },
    ];
    const singleScoreboard = mockScoreboards[0];

    mockFetchNBAScoreboardsEndpoint.mockResolvedValue({
      scoreboard: { games: mockGames },
    });
    mockTransformNBAGamesToScoreboards.mockReturnValue(mockScoreboards);
    mockFindScoreboardByCode.mockReturnValue(singleScoreboard);

    const request = createMockRequest({ code: '20250101/LALBOS' });
    const response = await GET(request);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual(singleScoreboard);
  });

  it('handles missing data gracefully when no games are found', async () => {
    mockFetchNBAScoreboardsEndpoint.mockResolvedValue({
      scoreboard: { games: [] },
    });

    const request = createMockRequest();
    const response = await GET(request);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toBeNull();
  });

  it('returns null when scoreboard not found for given code', async () => {
    const mockGames = [{ gameCode: '20250101/LALBOS', gameStatus: 1 }];

    mockFetchNBAScoreboardsEndpoint.mockResolvedValue({
      scoreboard: { games: mockGames },
    });
    mockTransformNBAGamesToScoreboards.mockReturnValue([]);
    mockFindScoreboardByCode.mockReturnValue(null);

    const request = createMockRequest({ code: '20250101/NOTFOUND' });
    const response = await GET(request);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toBeNull();
  });

  it('returns 500 on NBA API error', async () => {
    mockFetchNBAScoreboardsEndpoint.mockRejectedValue(
      new Error('NBA API down')
    );

    const request = createMockRequest();
    const response = await GET(request);

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json).toBeNull();
  });
});
