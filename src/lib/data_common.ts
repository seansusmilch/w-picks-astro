import { POCKETBASE_PUBLIC_URL } from 'astro:env/client';
import moment from 'moment';

export const getUserAvatarUrl = (user_id: string, filename: string) => {
  return new URL(
    `/api/files/users/${user_id}/${filename}`,
    POCKETBASE_PUBLIC_URL
  ).toString();
};

export function getDateBounds(dt = new Date()) {
  const dayStart = new Date(dt.setHours(0, 0, 0, 0));
  const dayEnd = new Date(dt.setHours(23, 59, 59, 999));
  return [dayStart, dayEnd];
}

export function getWeekBounds(dt = new Date()) {
  const day = dt.getDay();
  const weekStart = new Date(dt.setDate(dt.getDate() - day));
  const weekEnd = new Date(dt.setDate(dt.getDate() + 6));
  return [weekStart, weekEnd];
}

export function getCodePrefixFromDate(date: Date) {
  const codePrefix = moment(date).format('YYYYMMDD');
  console.log('date', codePrefix);
  return codePrefix;
}
