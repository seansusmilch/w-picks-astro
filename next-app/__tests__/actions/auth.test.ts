import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loginAction, logoutAction, signupAction } from '@/app/actions/auth';
import type { LoginFormState, SignupFormState } from '@/app/actions/auth';
import { ClientResponseError } from 'pocketbase';

vi.mock('@/lib/pocketbase-server', () => ({
  createPocketBase: vi.fn(),
  getAdminPocketBase: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    const error = new Error('NEXT_REDIRECT');
    (error as any).digest = `NEXT_REDIRECT;replace;${url};307;`;
    throw error;
  }),
}));

import { createPocketBase, getAdminPocketBase } from '@/lib/pocketbase-server';
import { cookies } from 'next/headers';

const mockCreatePocketBase = vi.mocked(createPocketBase);
const mockGetAdminPocketBase = vi.mocked(getAdminPocketBase);
const mockCookies = vi.mocked(cookies);

function createFormData(values: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}

describe('loginAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const mockCookieStore = {
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
    };
    mockCookies.mockResolvedValue(mockCookieStore as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns error on invalid credentials', async () => {
    const mockPb = {
      authStore: {
        token: null,
        model: null,
        record: null,
      },
      collection: vi.fn().mockReturnValue({
        authWithPassword: vi.fn().mockRejectedValue(
          new ClientResponseError({
            status: 400,
            message: 'Wrong email or password',
            data: {},
          })
        ),
      }),
    };
    mockCreatePocketBase.mockReturnValue(mockPb as any);

    const formData = createFormData({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    const result = await loginAction(undefined, formData);

    expect(result).toEqual({
      error: 'Wrong email or password',
    });
  });

  it('returns success on valid credentials', async () => {
    const mockCookieStore = {
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
    };
    mockCookies.mockResolvedValue(mockCookieStore as any);

    const mockPb = {
      authStore: {
        token: 'mock-auth-token',
        model: { id: 'mockuser000001' },
        record: { id: 'mockuser000001' },
      },
      collection: vi.fn().mockReturnValue({
        authWithPassword: vi.fn().mockResolvedValue({
          record: { id: 'mockuser000001' },
          token: 'mock-auth-token',
        }),
      }),
    };
    mockCreatePocketBase.mockReturnValue(mockPb as any);

    const formData = createFormData({
      email: 'test@example.com',
      password: 'correctpassword',
    });

    await expect(loginAction(undefined, formData)).rejects.toThrow('NEXT_REDIRECT');
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      'pb_auth',
      expect.any(String),
      expect.any(Object)
    );
  });

  it('returns error on validation failure', async () => {
    const formData = createFormData({
      email: 'not-an-email',
      password: '',
    });

    const result = await loginAction(undefined, formData);

    expect(result).toHaveProperty('error');
    expect(result.error).toBeDefined();
  });
});

describe('logoutAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('clears auth state and redirects', async () => {
    const mockCookieStore = {
      delete: vi.fn(),
    };
    mockCookies.mockResolvedValue(mockCookieStore as any);

    await expect(logoutAction()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockCookieStore.delete).toHaveBeenCalledWith('pb_auth');
  });
});

describe('signupAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns error on validation failure', async () => {
    const formData = createFormData({
      email: 'not-an-email',
      password: 'short',
      confirm_password: 'short',
    });

    const result = await signupAction(undefined, formData);

    expect(result).toHaveProperty('error');
    expect(result.error).toBeDefined();
  });

  it('returns error when passwords do not match', async () => {
    const formData = createFormData({
      email: 'test@example.com',
      password: 'password123',
      confirm_password: 'password456',
    });

    const result = await signupAction(undefined, formData);

    expect(result).toEqual({
      error: 'Passwords do not match!',
    });
  });

  it('returns success on valid signup', async () => {
    const mockAdminPb = {
      collection: vi.fn().mockReturnValue({
        create: vi.fn().mockResolvedValue({ id: 'mockuser000001' }),
        requestVerification: vi.fn().mockResolvedValue(undefined),
      }),
    };
    const mockPb = {
      collection: vi.fn().mockReturnValue({
        requestVerification: vi.fn().mockResolvedValue(undefined),
      }),
    };

    mockGetAdminPocketBase.mockResolvedValue(mockAdminPb as any);
    mockCreatePocketBase.mockReturnValue(mockPb as any);

    const formData = createFormData({
      email: 'test@example.com',
      password: 'password123',
      confirm_password: 'password123',
    });

    const result = await signupAction(undefined, formData);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Please check your email for a verification link!');
  });
});
