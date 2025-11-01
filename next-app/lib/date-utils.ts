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

