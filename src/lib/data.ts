import PocketBase, {
  type RecordAuthResponse,
  type RecordModel,
} from 'pocketbase';
import { UserZ, type UserType } from './definitions';
import { cookies } from 'next/headers';

const POCKETBASE_URL = process.env.POCKETBASE_URL || '';

/**
 * Get PocketBase instance for the current request
 * Loads authentication from cookies and refreshes if valid
 * This follows Next.js 15 best practices for per-request authentication
 */
export async function getRequestPB(): Promise<PocketBase> {
  const cookieStore = await cookies();
  const pb = new PocketBase(POCKETBASE_URL);
  pb.autoCancellation(false);

  // Load auth from cookie
  const pbAuthCookie = cookieStore.get('pb_auth');
  if (pbAuthCookie?.value) {
    try {
      // Load the auth store from cookie
      pb.authStore.loadFromCookie(`pb_auth=${pbAuthCookie.value}`);

      // Refresh the auth token if valid to ensure it's up-to-date
      if (pb.authStore.isValid && pb.authStore.model) {
        try {
          await pb.collection('users').authRefresh();
          // Update cookie with refreshed token
          const updatedCookie = pb.authStore.exportToCookie({
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 1209600, // 14 days
          });

          // Extract just the value part from the cookie string
          const cookieValue = updatedCookie.split('pb_auth=')[1]?.split(';')[0];
          if (cookieValue) {
            cookieStore.set('pb_auth', cookieValue, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              path: '/',
              maxAge: 1209600,
            });
          }
        } catch (error) {
          // Token invalid or expired, clear auth store
          pb.authStore.clear();
          cookieStore.delete('pb_auth');
        }
      }
    } catch (error) {
      // Invalid cookie format, clear it
      pb.authStore.clear();
    }
  }

  return pb;
}

/**
 * User authenticated PocketBase instance
 * @deprecated Use getRequestPB() instead for better Next.js 15 compatibility
 * This is kept for backward compatibility but will be removed in future versions
 */
export function getPB(authToken?: string) {
  const pb = new PocketBase(POCKETBASE_URL);
  pb.autoCancellation(false);

  if (authToken) {
    pb.authStore.save(authToken);
  }

  return pb;
}

/**
 * Cookie settings helper for Next.js
 */
export function cookieSettings({ requestUrl }: { requestUrl: string }) {
  return {
    secure: requestUrl.startsWith('https://'),
    httpOnly: true,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 1209600,
  };
}

/**
 * Admin authenticated PocketBase instance
 */
let apb: PocketBase | null = null;
let apbAuthPromise: Promise<void> | null = null;

/**
 * Authenticate the admin PocketBase instance
 */
async function ensureAPBAuthenticated() {
  if (!apb) {
    apb = new PocketBase(POCKETBASE_URL);
    apb.autoCancellation(false);
  }

  // Check if already authenticated
  if (apb.authStore.isValid && apb.authStore.model) {
    return;
  }

  // Authenticate as admin
  const adminEmail = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'ADMIN_USER and ADMIN_PASSWORD environment variables must be set'
    );
  }

  try {
    await apb.admins.authWithPassword(adminEmail, adminPassword);
  } catch (error) {
    console.error('Failed to authenticate admin PocketBase:', error);
    throw new Error('Failed to authenticate admin PocketBase instance');
  }
}

/**
 * Get admin authenticated PocketBase instance
 * This will authenticate on first call and reuse the authenticated instance
 */
export async function getAPB(): Promise<PocketBase> {
  // If already authenticated, return immediately
  if (apb && apb.authStore.isValid && apb.authStore.model) {
    return apb;
  }

  // If authentication is in progress, wait for it
  if (apbAuthPromise) {
    await apbAuthPromise;
    return apb!;
  }

  // Start authentication
  apbAuthPromise = ensureAPBAuthenticated();
  await apbAuthPromise;
  apbAuthPromise = null;

  return apb!;
}

/**
 * Get the current user from a PocketBase auth token
 * @deprecated Use getRequestPB() and check pb.authStore.model instead
 */
export async function getUser(authToken?: string) {
  if (!authToken) {
    return null;
  }

  try {
    const pb = getPB(authToken);

    // Verify and refresh the token
    if (pb.authStore.isValid) {
      const user = await pb
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
    // Token invalid or expired
    return null;
  }

  return null;
}

/**
 * Get the current authenticated user from request cookies
 * Uses getRequestPB() to load and refresh authentication
 */
export async function getRequestUser() {
  try {
    const pb = await getRequestPB();

    if (pb.authStore.isValid && pb.authStore.model) {
      const parsedUser = UserZ.safeParse(pb.authStore.model);
      if (!parsedUser.success) {
        console.error(
          'User validation failed',
          JSON.stringify(parsedUser.error, null, 2)
        );
        return null;
      }

      return {
        record: parsedUser.data,
        token: pb.authStore.token,
      };
    }
  } catch (error) {
    // Auth invalid or expired
    return null;
  }

  return null;
}
