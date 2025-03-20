import type { UserSettingsType } from '@/lib/definitions';
import { settingsStore } from '@/stores/settings';
import { getLogger } from '@/lib/logger';

const logger = getLogger('SettingsProvider');

/**
 * This component is used to provide the settings to the app.
 */
export function SettingsProvider({ settings }: { settings: UserSettingsType }) {
  settingsStore.set(settings);
  logger.debug({ settings }, 'Populated settings store');
  return <></>;
}
