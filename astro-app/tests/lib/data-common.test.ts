import { describe, it, expect, vi } from 'vitest';

import {
  getUserAvatarUrl,
  getDateBounds,
  getWeekBounds,
  getCodePrefixFromDate,
  getRandomEmoji,
  getUrlToMatchup,
} from '@/lib/data_common';

describe('getUserAvatarUrl', () => {
  it('returns a valid URL for valid inputs', () => {
    const url = getUserAvatarUrl('abc123', 'avatar.png');
    expect(url).toBe('http://localhost:8090/api/files/users/abc123/avatar.png');
  });

  it('returns null when user_id is empty', () => {
    expect(getUserAvatarUrl('', 'avatar.png')).toBeNull();
  });

  it('returns null when filename is empty', () => {
    expect(getUserAvatarUrl('abc123', '')).toBeNull();
  });

  it('returns null when both are empty', () => {
    expect(getUserAvatarUrl('', '')).toBeNull();
  });
});

describe('getDateBounds', () => {
  it('returns start and end of day for a given date', () => {
    const date = new Date('2024-06-15T12:30:00Z');
    const [start, end] = getDateBounds(date);

    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getMilliseconds()).toBe(0);

    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
    expect(end.getMilliseconds()).toBe(999);
  });

  it('defaults to current date when no argument', () => {
    const [start, end] = getDateBounds();
    expect(start.getTime()).toBeLessThanOrEqual(end.getTime());
  });
});

describe('getWeekBounds', () => {
  it('returns Sunday to Saturday for a week', () => {
    const wednesday = new Date('2024-06-12T12:00:00Z');
    const [weekStart, weekEnd] = getWeekBounds(wednesday);

    expect(weekStart.getDay()).toBe(0);
    expect(weekEnd.getDay()).toBe(6);
  });

  it('returns correct bounds when input is Sunday', () => {
    const sunday = new Date('2024-06-09T12:00:00Z');
    const [weekStart, weekEnd] = getWeekBounds(sunday);

    expect(weekStart.getDay()).toBe(0);
    expect(weekEnd.getDay()).toBe(6);
  });

  it('returns correct bounds when input is Saturday', () => {
    const saturday = new Date('2024-06-15T12:00:00Z');
    const [weekStart, weekEnd] = getWeekBounds(saturday);

    expect(weekStart.getDay()).toBe(0);
    expect(weekEnd.getDay()).toBe(6);
  });
});

describe('getCodePrefixFromDate', () => {
  it('formats date as yyyyMMdd in America/New_York timezone', () => {
    const date = new Date('2024-02-03T03:00:00Z');
    const prefix = getCodePrefixFromDate(date);
    expect(prefix).toBe('20240202');
  });

  it('returns correct prefix during ET daytime', () => {
    const date = new Date('2024-06-15T18:00:00Z');
    const prefix = getCodePrefixFromDate(date);
    expect(prefix).toBe('20240615');
  });
});

describe('getRandomEmoji', () => {
  it('returns a string from the emoji list', () => {
    const result = getRandomEmoji();
    expect(result).toMatch(/^\/assets\/emojis\/emoji\d+\.(png|gif|jpg)$/);
  });

  it('returns different values over many calls (probabilistic)', () => {
    const results = new Set(
      Array.from({ length: 50 }, () => getRandomEmoji())
    );
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('getUrlToMatchup', () => {
  it('splits code on slash and constructs URL', () => {
    const url = getUrlToMatchup('20240203/LALNYK');
    expect(url).toBe('/matchups?page=20240203&game=LALNYK');
  });

  it('handles codes with no slash gracefully', () => {
    const url = getUrlToMatchup('nocode');
    expect(url).toBe('/matchups?page=nocode&game=undefined');
  });
});
