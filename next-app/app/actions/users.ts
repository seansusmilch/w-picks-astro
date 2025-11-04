'use server';

import { z } from 'zod';
import { ClientResponseError } from 'pocketbase';
import { getAdminPocketBase } from '@/lib/pocketbase-server';
import { getAuthenticatedUser } from '@/lib/pocketbase-server';
import { UserZ, PickZ, type UserType, type PickType } from '@/lib/definitions';
import { revalidatePath } from 'next/cache';

/**
 * Fetch a user record by username using an admin PocketBase instance.
 */
export async function getUserByUsername(
  username: string
): Promise<UserType | null> {
  const pb = await getAdminPocketBase();

  try {
    const userRecord = await pb
      .collection('users')
      .getFirstListItem(`username = "${username}"`)
      .catch(() => null);

    if (!userRecord) return null;

    const parsed = UserZ.safeParse(userRecord);
    if (!parsed.success) {
      console.error('getUserByUsername: user validation failed', parsed.error);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('getUserByUsername: failed to fetch user', error);
    return null;
  }
}

/**
 * Fetch picks for a user. Expands matchup by default to power the pick table.
 */
export async function getPicksByUser(userId: string): Promise<PickType[]> {
  const pb = await getAdminPocketBase();

  try {
    const picksRecords = await pb.collection('picks').getFullList({
      sort: '-matchup.time_utc',
      filter: `user = "${userId}"`,
      expand: 'matchup',
    });

    const picks: PickType[] = [];
    for (const rec of picksRecords) {
      const parsed = PickZ.safeParse(rec);
      if (parsed.success) {
        picks.push(parsed.data);
      } else {
        console.warn('getPicksByUser: pick validation failed', {
          pickId: rec.id,
          issues: parsed.error.issues,
        });
      }
    }

    return picks;
  } catch (error) {
    console.error('getPicksByUser: failed to fetch picks', error);
    return [];
  }
}

const updateProfileSchema = z.object({
  username: z.string().min(1, 'Username is required').optional(),
  bio: z.string().optional(),
  avatar: z.instanceof(File).optional(),
});

export type UpdateProfileFormState = {
  error?: string;
  success?: boolean;
  message?: string;
};

/**
 * Update the authenticated user's profile.
 * All PocketBase operations happen server-side.
 */
export async function updateProfileAction(
  prevState: UpdateProfileFormState | undefined,
  formData: FormData
): Promise<UpdateProfileFormState> {
  try {
    // Verify authentication first
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        error: 'You must be logged in to update your profile',
      };
    }

    // Extract form data
    const username = formData.get('username')?.toString();
    const bio = formData.get('bio')?.toString();
    const avatar = formData.get('avatar') as File | null;

    // Build data object, only including fields that have values
    const data: Record<string, unknown> = {};
    if (username !== null && username !== undefined && username !== '') {
      data.username = username.trim();
    }
    if (bio !== null && bio !== undefined) {
      data.bio = bio;
    }
    if (avatar && avatar.size > 0) {
      data.avatar = avatar;
    }

    // Validate with Zod schema
    const result = updateProfileSchema.safeParse(data);

    if (!result.success) {
      return {
        error: result.error.issues[0]?.message || 'Invalid input',
      };
    }

    // Remove null/empty values to avoid overwriting fields (critical pattern from Astro)
    const updateData: Record<string, unknown> = {};
    for (const key in result.data) {
      const value = result.data[key as keyof typeof result.data];
      if (value !== null && value !== undefined && value !== '') {
        // For File, check size > 0
        if (value instanceof File) {
          if (value.size > 0) {
            updateData[key] = value;
          }
        } else {
          updateData[key] = value;
        }
      }
    }

    // If no fields to update, return early
    if (Object.keys(updateData).length === 0) {
      return {
        error: 'No changes to save',
      };
    }

    // Use admin PocketBase instance for profile updates
    const pb = await getAdminPocketBase();

    // Update user record
    const updatedUser = await pb
      .collection('users')
      .update(user.record.id, updateData);

    // Validate response
    const parsed = UserZ.safeParse(updatedUser);
    if (!parsed.success) {
      console.error(
        'updateProfileAction: user validation failed',
        parsed.error
      );
      return {
        error: 'Failed to update profile',
      };
    }

    // Revalidate profile pages
    revalidatePath('/profile');
    revalidatePath('/profile/edit');

    return {
      success: true,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    if (error instanceof ClientResponseError) {
      if (error.status === 400) {
        // Handle validation errors (e.g., username uniqueness)
        return {
          error: error.message || 'Validation error',
        };
      }
      console.error('updateProfileAction: PocketBase error', {
        status: error.status,
        message: error.message,
      });
      return {
        error: error.message || 'Failed to update profile',
      };
    }

    console.error('updateProfileAction: Unexpected error', {
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      error: 'Something went wrong. Please try again.',
    };
  }
}
