import { POCKETBASE_PUBLIC_URL } from 'astro:env/client';
import { DateTime } from 'luxon';
import type { RecordModel } from 'pocketbase';

export const expandAvatarUrl = (items: RecordModel[]) => {
  return items.map((item) => {
    item.expand.user.avatar_url = getUserAvatarUrl(
      item.expand.user.id,
      item.expand.user.avatar
    );
    return item;
  });
};

export const getUserAvatarUrl = (user_id: string, filename: string) => {
  if (!filename || !user_id) return null;
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
  const codePrefix = DateTime.fromJSDate(date)
    .setZone('America/New_York')
    .toFormat('yyyyMMdd');
  return codePrefix;
}
