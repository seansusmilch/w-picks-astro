'use client';

import type { UserSettingsType } from '@/lib/definitions';
import { settingsStore } from '@/stores/settings';

/**
 * This component is used to provide the settings to the app.
 */
export function SettingsProvider({ settings }: { settings: UserSettingsType }) {
  settingsStore.set(settings);
  return <></>;
}
