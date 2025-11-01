import { DateTime } from 'luxon';
import type { RecordModel } from 'pocketbase';

const POCKETBASE_PUBLIC_URL = process.env.POCKETBASE_PUBLIC_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || '';

export const expandAvatarUrl = (items: RecordModel[]) => {
  return items.map((item) => {
    if (item.expand?.user) {
      item.expand.user.avatar_url = getUserAvatarUrl(
        item.expand.user.id,
        item.expand.user.avatar
      );
    }
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

export function getRandomEmoji() {
  const emojis = [
    '/assets/emojis/emoji1.png',
    '/assets/emojis/emoji2.gif',
    '/assets/emojis/emoji3.gif',
    '/assets/emojis/emoji4.png',
    '/assets/emojis/emoji5.gif',
    '/assets/emojis/emoji6.jpg',
  ];

  return emojis[Math.floor(Math.random() * emojis.length)];
}

export function getUrlToMatchup(code: string) {
  const [page, game] = code.split('/');
  return `/matchups?page=${page}&game=${game}`;
}
