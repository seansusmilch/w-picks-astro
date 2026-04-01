import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGamesByCodePrefix, getMatchupPageData } from '@/app/actions/matchups';
import { mockUser, mockMatchup, mockPick, mockGame } from '@/__tests__/fixtures/pocketbase-mock';

vi.mock('@/lib/pocketbase-server', () => ({
  getAuthenticatedUser: vi.fn(),
  getAdminPocketBase: vi.fn(),
  initPocketBase: vi.fn(),
}));

vi.mock('@/app/actions/scoreboards', () => ({
  getScoreboardByCode: vi.fn(),
  getScoreboardsByCodePrefix: vi.fn(),
}));

import { getAdminPocketBase, initPocketBase } from '@/lib/pocketbase-server';
import { getScoreboardByCode, getScoreboardsByCodePrefix } from '@/app/actions/scoreboards';

const mockGetAdminPocketBase = vi.mocked(getAdminPocketBase);
const mockInitPocketBase = vi.mocked(initPocketBase);
const mockGetScoreboardByCode = vi.mocked(getScoreboardByCode);
const mockGetScoreboardsByCodePrefix = vi.mocked(getScoreboardsByCodePrefix);

describe('getGamesByCodePrefix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns games for valid dateCode', async () => {
    const matchup = mockMatchup({ code: '002250000001234' });
    const pick = mockPick({ matchup: matchup.id });

    const mockPb = {
      collection: vi.fn().mockReturnValue({
        getFullList: vi.fn().mockResolvedValue([
          {
            ...matchup,
            expand: {
              picks_via_matchup: [pick],
            },
          },
        ]),
      }),
    };
    mockGetAdminPocketBase.mockResolvedValue(mockPb as any);
    mockGetScoreboardsByCodePrefix.mockResolvedValue([]);

    const result = await getGamesByCodePrefix('002');

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].matchup.code).toBe('002250000001234');
  });

  it('returns empty array for no matches', async () => {
    const mockPb = {
      collection: vi.fn().mockReturnValue({
        getFullList: vi.fn().mockResolvedValue([]),
      }),
    };
    mockGetAdminPocketBase.mockResolvedValue(mockPb as any);
    mockGetScoreboardsByCodePrefix.mockResolvedValue([]);

    const result = await getGamesByCodePrefix('999');

    expect(result).toEqual([]);
  });
});

describe('getMatchupPageData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns matchup with games and picks', async () => {
    const user = mockUser();
    const matchup = mockMatchup({ code: '002250000001234' });
    const pick = mockPick({
      matchup: matchup.id,
      user: user.id,
      expand: {
        user,
        matchup,
      },
    });

    const mockPb = {
      collection: vi.fn().mockReturnValue({
        getFirstListItem: vi.fn().mockResolvedValue({
          ...matchup,
          expand: {
            picks_via_matchup: [pick],
          },
        }),
      }),
    };
    mockGetAdminPocketBase.mockResolvedValue(mockPb as any);
    mockGetScoreboardByCode.mockResolvedValue(null);

    const result = await getMatchupPageData('002250000001234');

    expect(result).not.toBeNull();
    expect(result?.matchup.code).toBe('002250000001234');
    expect(result?.picks.length).toBe(1);
    expect(result?.picks[0].user).toBe(user.id);
  });

  it('returns null for invalid matchup code', async () => {
    const mockPb = {
      collection: vi.fn().mockReturnValue({
        getFirstListItem: vi.fn().mockResolvedValue(null),
      }),
    };
    mockGetAdminPocketBase.mockResolvedValue(mockPb as any);

    const result = await getMatchupPageData('invalid-code');

    expect(result).toBeNull();
  });
});
