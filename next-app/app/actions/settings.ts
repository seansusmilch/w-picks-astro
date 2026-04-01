'use server';

import { z } from 'zod';
import { ClientResponseError } from 'pocketbase';
import { getAuthenticatedUser, getAdminPocketBase } from '@/lib/pocketbase-server';
import { UserSettingsZ } from '@/lib/definitions';
import { revalidatePath } from 'next/cache';

export type SettingsFormState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function updateSettingsAction(
  prevState: SettingsFormState | undefined,
  formData: FormData
): Promise<SettingsFormState> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { error: 'You must be logged in to update settings' };
    }

    const colorfulPicks = formData.get('colorfulPicks') === 'on';
    const hideFromLatestPicks = formData.get('hideFromLatestPicks') === 'on';

    const settings = UserSettingsZ.parse({ colorfulPicks, hideFromLatestPicks });

    const pb = await getAdminPocketBase();
    await pb.collection('users').update(user.record.id, { settings });

    revalidatePath('/profile');
    revalidatePath('/profile/settings');

    return { success: true, message: 'Settings updated' };
  } catch (error) {
    if (error instanceof ClientResponseError) {
      return { error: error.message || 'Failed to update settings' };
    }

    if (error instanceof z.ZodError) {
      return { error: 'Invalid settings data' };
    }

    return { error: 'Something went wrong. Please try again.' };
  }
}
