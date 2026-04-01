import { DateTime } from 'luxon';

export function getCodePrefixFromDate(date: Date): string {
  return DateTime.fromJSDate(date)
    .setZone('America/New_York')
    .toFormat('yyyyMMdd');
}

export function getCurrentWeekCodePrefixes(): string[] {
  const now = new Date();
  const day = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - day);
  weekStart.setHours(0, 0, 0, 0);

  const codePrefixes: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    codePrefixes.push(getCodePrefixFromDate(date));
  }

  return codePrefixes;
}

/**
 * Gets today's date code prefix
 */
export function getTodayCodePrefix(): string {
  return getCodePrefixFromDate(new Date());
}

/**
 * Generates an initial date range for the weekly page
 * Returns: 7 days in the past, today, 14 days in the future (22 total days)
 */
export function getInitialDateRange(): string[] {
  const today = new Date();
  const dates: string[] = [];

  // 7 days in the past
  for (let i = 7; i > 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(getCodePrefixFromDate(date));
  }

  // Today
  dates.push(getCodePrefixFromDate(today));

  // 14 days in the future
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(getCodePrefixFromDate(date));
  }

  return dates;
}

/**
 * Expands a date range by adding more days in a specific direction
 * @param currentRange - Array of date code prefixes
 * @param direction - 'left' (past) or 'right' (future)
 * @param daysToAdd - Number of days to add (default: 7)
 */
export function expandDateRange(
  currentRange: string[],
  direction: 'left' | 'right',
  daysToAdd: number = 7
): string[] {
  if (currentRange.length === 0) {
    return getInitialDateRange();
  }

  const newDates: string[] = [];

  if (direction === 'left') {
    // Get the earliest date and go backwards
    const earliestDateStr = currentRange[0];
    const earliestDate = DateTime.fromFormat(earliestDateStr, 'yyyyMMdd', {
      zone: 'America/New_York',
    });

    // Add dates going backwards
    for (let i = daysToAdd; i > 0; i--) {
      const date = earliestDate.minus({ days: i });
      newDates.push(date.toFormat('yyyyMMdd'));
    }

    // Prepend new dates to existing range
    return [...newDates, ...currentRange];
  } else {
    // Get the latest date and go forwards
    const latestDateStr = currentRange[currentRange.length - 1];
    const latestDate = DateTime.fromFormat(latestDateStr, 'yyyyMMdd', {
      zone: 'America/New_York',
    });

    // Add dates going forwards
    for (let i = 1; i <= daysToAdd; i++) {
      const date = latestDate.plus({ days: i });
      newDates.push(date.toFormat('yyyyMMdd'));
    }

    // Append new dates to existing range
    return [...currentRange, ...newDates];
  }
}

/**
 * Converts a date code prefix to a Date object
 */
export function dateCodeToDate(dateCode: string): Date {
  const dt = DateTime.fromFormat(dateCode, 'yyyyMMdd', {
    zone: 'America/New_York',
  });
  return dt.toJSDate();
}

/**
 * Checks if a date code is today
 */
export function isToday(dateCode: string): boolean {
  return dateCode === getTodayCodePrefix();
}
