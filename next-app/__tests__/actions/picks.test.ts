import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitPickAction, deletePickAction } from '@/app/actions/picks';
import type { SubmitPickFormState, DeletePickFormState } from '@/app/actions/picks';
import { mockUser, mockPick, mockMatchup } from '@/__tests__/fixtures/pocketbase-mock';

vi.mock('@/lib/pocketbase-server', () => ({
  getAuthenticatedUser: vi.fn(),
  getAdminPocketBase: vi.fn(),
  initPocketBase: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { getAuthenticatedUser, initPocketBase } from '@/lib/pocketbase-server';
import { revalidatePath } from 'next/cache';

const mockGetAuthenticatedUser = vi.mocked(getAuthenticatedUser);
const mockInitPocketBase = vi.mocked(initPocketBase);
const mockRevalidatePath = vi.mocked(revalidatePath);

function createFormData(values: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}

function createMockPb(overrides: { matchupRecord?: any; pickRecord?: any } = {}) {
  const collectionMock = vi.fn();

  collectionMock.mockImplementation((name: string) => {
    if (name === 'matchups') {
      return {
        getOne: vi.fn().mockResolvedValue(
          overrides.matchupRecord || mockMatchup()
        ),
      };
    }
    if (name === 'picks') {
      return {
        getOne: vi.fn().mockResolvedValue(overrides.pickRecord || null),
        create: vi.fn().mockResolvedValue(overrides.pickRecord || {
          id: 'mockpick0000001',
          created: '2025-03-14 12:00:00.000Z',
          updated: '2025-03-14 12:00:00.000Z',
          matchup: 'mockmatchup0001',
          win_prediction: 'BOS',
          comment: 'Test pick',
          user: 'mockuser0000001',
          status: 'upcoming',
          result: '',
        }),
        delete: vi.fn().mockResolvedValue(undefined),
      };
    }
    return {
      getOne: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue(undefined),
    };
  });

  return collectionMock;
}

describe('submitPickAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const formData = createFormData({
      win_prediction: 'BOS',
      matchup: 'mockmatchup0001',
    });

    const result = await submitPickAction(undefined, formData);

    expect(result).toEqual({
      error: 'You must be logged in to submit a pick',
    });
  });

  it('returns error on validation failure (invalid win_prediction length)', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({
      record: mockUser(),
      token: 'mock-token',
    });

    const formData = createFormData({
      win_prediction: 'BOSTON',
      matchup: 'mockmatchup0001',
    });

    const result = await submitPickAction(undefined, formData);

    expect(result).toHaveProperty('error');
    expect(result.error).toBeDefined();
  });

  it('returns error for indeterminate win_prediction', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({
      record: mockUser(),
      token: 'mock-token',
    });

    const formData = createFormData({
      win_prediction: 'indeterminate',
      matchup: 'mockmatchup0001',
    });

    const result = await submitPickAction(undefined, formData);

    expect(result).toHaveProperty('error');
    expect(result.error).toContain('Too big');
  });

  it('successfully creates a pick when authenticated', async () => {
    const user = mockUser();
    const matchup = mockMatchup();

    mockGetAuthenticatedUser.mockResolvedValue({
      record: user,
      token: 'mock-token',
    });

    const createdPick = {
      id: 'mockpick0000001',
      created: '2025-03-14 12:00:00.000Z',
      updated: '2025-03-14 12:00:00.000Z',
      matchup: matchup.id,
      win_prediction: 'BOS',
      comment: 'Test pick',
      user: user.id,
      status: 'upcoming',
      result: '',
    };

    const mockPb = createMockPb({
      matchupRecord: matchup,
      pickRecord: createdPick,
    });
    mockInitPocketBase.mockResolvedValue({ collection: mockPb } as any);

    const formData = createFormData({
      win_prediction: 'BOS',
      comment: 'Test pick',
      matchup: matchup.id,
    });

    const result = await submitPickAction(undefined, formData);

    expect(result.success).toBe(true);
    expect(result.pick).toBeDefined();
    expect(result.pick?.win_prediction).toBe('BOS');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/matchup', 'page');
  });
});

describe('deletePickAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const formData = createFormData({
      id: 'mockpick0000001',
      matchup: 'mockmatchup0001',
    });

    const result = await deletePickAction(undefined, formData);

    expect(result).toEqual({
      error: 'You must be logged in to delete a pick',
    });
  });

  it('successfully deletes a pick when authenticated', async () => {
    const user = mockUser();
    const pick = mockPick({ user: user.id });

    mockGetAuthenticatedUser.mockResolvedValue({
      record: user,
      token: 'mock-token',
    });

    const mockPb = createMockPb({ pickRecord: pick });
    mockInitPocketBase.mockResolvedValue({ collection: mockPb } as any);

    const formData = createFormData({
      id: pick.id,
      matchup: pick.matchup,
    });

    const result = await deletePickAction(undefined, formData);

    expect(result.success).toBe(true);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/matchup', 'page');
  });
});
