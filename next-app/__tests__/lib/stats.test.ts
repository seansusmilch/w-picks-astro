import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { expandAvatarUrls, getStatsByUserId } from '@/lib/stats';
import type { StatType, UserType } from '@/lib/definitions';
import type { RecordModel } from 'pocketbase';

const mockInitPocketBase = vi.fn();
const mockGetAdminPocketBase = vi.fn();

vi.mock('@/lib/pocketbase-server', () => ({
  initPocketBase: () => mockInitPocketBase(),
  getAdminPocketBase: () => mockGetAdminPocketBase(),
}));

vi.mock('@/lib/logger', () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}));

vi.mock('@/lib/utils', () => ({
  getUserAvatarUrl: vi.fn((userId: string, filename: string) => {
    if (!filename || !userId) return null;
    return `https://pb.example.com/api/files/users/${userId}/${filename}`;
  }),
}));

describe('expandAvatarUrls', () => {
  it('transforms avatar field to avatar_url with correct prefix', () => {
    const user: UserType = {
      id: 'user12345678901',
      created: '2025-01-01T00:00:00Z',
      updated: '2025-01-01T00:00:00Z',
      email: 'test@example.com',
      username: 'testuser',
      avatar: 'avatar.png',
      bio: '',
      settings: null,
    };

    const item = {
      id: 'stat12345678901',
      created: '',
      updated: '',
      expand: { user },
    } as RecordModel & { expand?: { user?: UserType } };

    const result = expandAvatarUrls([item]);
    expect(result[0].expand?.user?.avatar_url).toBe(
      'https://pb.example.com/api/files/users/user12345678901/avatar.png'
    );
  });

  it('handles missing expand.user', () => {
    const item = {
      id: 'stat12345678901',
      created: '',
      updated: '',
      expand: {},
    } as RecordModel & { expand?: { user?: UserType } };

    const result = expandAvatarUrls([item]);
    expect(result[0].expand?.user?.avatar_url).toBeUndefined();
  });

  it('handles null avatar', () => {
    const user: UserType = {
      id: 'user12345678901',
      created: '2025-01-01T00:00:00Z',
      updated: '2025-01-01T00:00:00Z',
      email: 'test@example.com',
      username: 'testuser',
      avatar: '',
      bio: '',
      settings: null,
    };

    const item = {
      id: 'stat12345678901',
      created: '',
      updated: '',
      expand: { user },
    } as RecordModel & { expand?: { user?: UserType } };

    const result = expandAvatarUrls([item]);
    expect(result[0].expand?.user?.avatar_url).toBeUndefined();
  });
});

describe('getStatsByUserId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed stats on success', async () => {
    const mockStats: StatType = {
      user: 'user12345678901',
      total_picks: 10,
      win_picks: 6,
      lose_picks: 4,
      win_loss_ratio: 1.5,
      win_pick_rate: 60,
    };

    mockInitPocketBase.mockResolvedValue({
      collection: vi.fn().mockReturnValue({
        getFirstListItem: vi.fn().mockResolvedValue(mockStats),
      }),
    });

    const result = await getStatsByUserId('user12345678901');
    expect(result).toEqual(mockStats);
  });

  it('returns null when stats not found', async () => {
    mockInitPocketBase.mockResolvedValue({
      collection: vi.fn().mockReturnValue({
        getFirstListItem: vi
          .fn()
          .mockRejectedValue(new Error('Record not found')),
      }),
    });

    const result = await getStatsByUserId('user12345678901');
    expect(result).toBeNull();
  });

  it('returns null on validation failure', async () => {
    const invalidStats = {
      user: 'short',
      total_picks: -1,
      win_picks: 0,
      lose_picks: 0,
      win_loss_ratio: null,
      win_pick_rate: null,
    };

    mockInitPocketBase.mockResolvedValue({
      collection: vi.fn().mockReturnValue({
        getFirstListItem: vi.fn().mockResolvedValue(invalidStats),
      }),
    });

    const result = await getStatsByUserId('user12345678901');
    expect(result).toBeNull();
  });

  it('returns null on unexpected errors', async () => {
    mockInitPocketBase.mockResolvedValue({
      collection: vi.fn().mockReturnValue({
        getFirstListItem: vi.fn().mockRejectedValue(new Error('Network error')),
      }),
    });

    const result = await getStatsByUserId('user12345678901');
    expect(result).toBeNull();
  });
});
