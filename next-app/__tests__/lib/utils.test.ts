import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cn, getUserAvatarUrl } from '@/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('merges tailwind conflicts (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles undefined and null inputs', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });
});

describe('getUserAvatarUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns null when filename is empty', () => {
    process.env.POCKETBASE_PUBLIC_URL = 'http://localhost:8090';
    expect(getUserAvatarUrl('user123', '')).toBeNull();
  });

  it('returns null when userId is empty', () => {
    process.env.POCKETBASE_PUBLIC_URL = 'http://localhost:8090';
    expect(getUserAvatarUrl('', 'avatar.png')).toBeNull();
  });

  it('returns null when POCKETBASE_PUBLIC_URL is not set', () => {
    delete process.env.POCKETBASE_PUBLIC_URL;
    delete process.env.NEXT_PUBLIC_POCKETBASE_PUBLIC_URL;
    expect(getUserAvatarUrl('user123', 'avatar.png')).toBeNull();
  });

  it('constructs correct avatar URL', () => {
    process.env.POCKETBASE_PUBLIC_URL = 'http://localhost:8090';
    const result = getUserAvatarUrl('user123', 'avatar.png');
    expect(result).toBe('http://localhost:8090/api/files/users/user123/avatar.png');
  });

  it('falls back to NEXT_PUBLIC_POCKETBASE_PUBLIC_URL', () => {
    delete process.env.POCKETBASE_PUBLIC_URL;
    process.env.NEXT_PUBLIC_POCKETBASE_PUBLIC_URL = 'https://pb.example.com';
    const result = getUserAvatarUrl('abc', 'pic.jpg');
    expect(result).toBe('https://pb.example.com/api/files/users/abc/pic.jpg');
  });
});
