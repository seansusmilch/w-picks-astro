import PocketBase, {
  type RecordAuthResponse,
  type RecordModel,
} from 'pocketbase';
import { POCKETBASE_URL } from 'astro:env/server';
import type { AstroCookieSetOptions } from 'astro';
import { UserZ, type UserType } from './definitions';
let pb: PocketBase;
let apb: PocketBase;
let user: RecordAuthResponse<RecordModel>;

/**
 * User authenticated PocketBase instance
 */
export function getPB() {
  if (!pb) {
    pb = new PocketBase(POCKETBASE_URL);
  }
  pb.autoCancellation(false);
  return pb;
}

export function cookieSettings({ requestUrl }: { requestUrl: string }) {
  return {
    secure: requestUrl.startsWith('https://'),
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 1209600,
  } as AstroCookieSetOptions;
}

/**
 * Admin authenticated PocketBase instance
 */
export function getAPB() {
  if (!apb) {
    apb = new PocketBase(POCKETBASE_URL);
  }
  apb.autoCancellation(false);
  return apb;
}

/**
 * Get the current user
 */
export async function getUser() {
  try {
    // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
    if (pb.authStore.isValid) {
      user = await pb
        .collection('users')
        .authRefresh({ requestKey: crypto.randomUUID() });

      const parsedUser = UserZ.safeParse(user.record);
      if (!parsedUser.success) {
        console.error(
          'User validation failed',
          JSON.stringify(parsedUser.error, null, 2)
        );
        throw new Error('User validation failed');
      }
      return {
        record: parsedUser.data,
        token: user.token,
      };
    }
  } catch (_) {
    // clear the auth store on failed refresh
    pb.authStore.clear();
  }
}
