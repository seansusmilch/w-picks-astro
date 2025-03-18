import { UserSettingsZ, type UserSettingsType } from '@/lib/definitions';
import { atom } from 'nanostores';

export const settingsStore = atom<UserSettingsType>(UserSettingsZ.parse({}));
