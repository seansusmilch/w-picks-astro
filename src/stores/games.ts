import type { GameType, PageEntryType } from '@/lib/definitions';
import { atom } from 'nanostores';

export const gamesStore = atom<GameType[]>([]);
export const pagesStore = atom<PageEntryType[]>([]);
export const userIdStore = atom<string>('');
export const currentPageStore = atom<string>('');
