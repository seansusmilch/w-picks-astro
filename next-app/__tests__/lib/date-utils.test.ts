import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCodePrefixFromDate,
  getCurrentWeekCodePrefixes,
  getInitialDateRange,
  expandDateRange,
  dateCodeToDate,
  isToday,
} from '@/lib/date-utils';

describe('getCodePrefixFromDate', () => {
  it('formats a date as yyyyMMdd in America/New_York timezone', () => {
    const date = new Date('2025-01-15T12:00:00Z');
    const result = getCodePrefixFromDate(date);
    expect(result).toMatch(/^\d{8}$/);
  });

  it('uses Eastern Time for date calculation', () => {
    const utcMidnight = new Date('2025-03-15T04:00:00Z');
    const result = getCodePrefixFromDate(utcMidnight);
    expect(result).toBe('20250315');
  });

  it('handles dates near midnight ET correctly', () => {
    const justBeforeMidnightET = new Date('2025-03-15T03:59:00Z');
    const result = getCodePrefixFromDate(justBeforeMidnightET);
    expect(result).toBe('20250314');
  });

  it('pads single-digit months and days', () => {
    const date = new Date('2025-02-05T15:00:00Z');
    const result = getCodePrefixFromDate(date);
    expect(result).toBe('20250205');
  });
});

describe('getCurrentWeekCodePrefixes', () => {
  it('returns 7 date codes', () => {
    const result = getCurrentWeekCodePrefixes();
    expect(result).toHaveLength(7);
  });

  it('returns codes in ascending order', () => {
    const result = getCurrentWeekCodePrefixes();
    for (let i = 1; i < result.length; i++) {
      expect(result[i] > result[i - 1]).toBe(true);
    }
  });

  it('each code is 8 digits', () => {
    const result = getCurrentWeekCodePrefixes();
    for (const code of result) {
      expect(code).toMatch(/^\d{8}$/);
    }
  });

  it('includes today', () => {
    const result = getCurrentWeekCodePrefixes();
    const todayCode = getCodePrefixFromDate(new Date());
    expect(result).toContain(todayCode);
  });
});

describe('getInitialDateRange', () => {
  it('returns 22 date codes (7 past + today + 14 future)', () => {
    const result = getInitialDateRange();
    expect(result).toHaveLength(22);
  });

  it('includes today in the range', () => {
    const result = getInitialDateRange();
    const todayCode = getCodePrefixFromDate(new Date());
    expect(result).toContain(todayCode);
  });

  it('today is at index 7 (after 7 past days)', () => {
    const result = getInitialDateRange();
    const todayCode = getCodePrefixFromDate(new Date());
    expect(result[7]).toBe(todayCode);
  });

  it('all codes are unique', () => {
    const result = getInitialDateRange();
    expect(new Set(result).size).toBe(result.length);
  });
});

describe('expandDateRange', () => {
  const baseRange = ['20250310', '20250311', '20250312', '20250313', '20250314'];

  it('prepends dates when expanding left', () => {
    const result = expandDateRange(baseRange, 'left', 3);
    expect(result).toHaveLength(baseRange.length + 3);
    expect(result.slice(3)).toEqual(baseRange.slice());
  });

  it('appends dates when expanding right', () => {
    const result = expandDateRange(baseRange, 'right', 3);
    expect(result).toHaveLength(baseRange.length + 3);
    expect(result.slice(0, baseRange.length)).toEqual(baseRange);
  });

  it('prepends correct dates going backwards from earliest', () => {
    const result = expandDateRange(baseRange, 'left', 2);
    expect(result[0]).toBe('20250308');
    expect(result[1]).toBe('20250309');
  });

  it('appends correct dates going forwards from latest', () => {
    const result = expandDateRange(baseRange, 'right', 2);
    const lastIdx = result.length - 1;
    expect(result[lastIdx - 1]).toBe('20250315');
    expect(result[lastIdx]).toBe('20250316');
  });

  it('returns initial date range when current range is empty', () => {
    const result = expandDateRange([], 'left');
    expect(result).toHaveLength(22);
  });

  it('defaults to 7 days when daysToAdd not specified', () => {
    const result = expandDateRange(baseRange, 'right');
    expect(result).toHaveLength(baseRange.length + 7);
  });
});

describe('dateCodeToDate', () => {
  it('converts a date code back to a Date object in ET', () => {
    const result = dateCodeToDate('20250315');
    expect(result).toBeInstanceOf(Date);
    const etYear = result.toLocaleString('en-US', { timeZone: 'America/New_York', year: 'numeric' });
    const etMonth = result.toLocaleString('en-US', { timeZone: 'America/New_York', month: '2-digit' });
    const etDay = result.toLocaleString('en-US', { timeZone: 'America/New_York', day: '2-digit' });
    expect(etYear).toBe('2025');
    expect(etMonth).toBe('03');
    expect(etDay).toBe('15');
  });
});

describe('isToday', () => {
  it('returns true for today\'s code', () => {
    const todayCode = getCodePrefixFromDate(new Date());
    expect(isToday(todayCode)).toBe(true);
  });

  it('returns false for a different date', () => {
    expect(isToday('19990101')).toBe(false);
  });
});
