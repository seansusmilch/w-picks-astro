import PocketBase, {
  type RecordAuthResponse,
  type RecordModel,
} from 'pocketbase';
import { cookies } from 'next/headers';
import { UserZ, type UserType } from './definitions';

const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Singleton for admin PocketBase instance
let adminPb: PocketBase | null = null;
let adminAuthPromise: Promise<PocketBase> | null = null;

export function createPocketBase(): PocketBase {
  console.log('createPocketBase', POCKETBASE_URL);
  const pb = new PocketBase(POCKETBASE_URL);
  pb.autoCancellation(false);
  return pb;
}

export async function initPocketBase(): Promise<PocketBase> {
  const pb = createPocketBase();
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('pb_auth');

  if (authCookie) {
    console.log('[initPocketBase] Loading auth from cookie', {
      cookieExists: !!authCookie,
      cookieLength: authCookie.value.length,
    });

    try {
      const cookieString = `pb_auth=${authCookie.value}`;
      pb.authStore.loadFromCookie(cookieString);

      if (!pb.authStore.isValid) {
        pb.authStore.loadFromCookie(authCookie.value);
      }
    } catch (error) {
      console.error('[initPocketBase] Error loading auth from cookie', {
        error: error instanceof Error ? error.message : String(error),
      });
      pb.authStore.clear();
    }

    console.log('[initPocketBase] Auth store loaded', {
      isValid: pb.authStore.isValid,
      hasRecord: !!pb.authStore.record,
      hasToken: !!pb.authStore.token,
    });

    if (pb.authStore.isValid) {
      try {
        await pb.collection('users').authRefresh();
      } catch {
        pb.authStore.clear();
      }
    }
  }

  return pb;
}

export function getCookieSettings(isSecure: boolean = false) {
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7 * 2, // 14 days
  };
}

export async function getAuthenticatedUser(): Promise<{
  record: UserType;
  token: string;
} | null> {
  const pb = await initPocketBase();

  if (!pb.authStore.isValid || !pb.authStore.record) {
    return null;
  }

  try {
    const parsedUser = UserZ.safeParse(pb.authStore.record);
    if (!parsedUser.success) {
      console.error('User validation failed', parsedUser.error);
      return null;
    }

    return {
      record: parsedUser.data,
      token: pb.authStore.token,
    };
  } catch {
    return null;
  }
}

/**
 * Get an admin-authenticated PocketBase instance.
 * This instance is authenticated as a superuser and can perform
 * administrative operations that require elevated privileges.
 *
 * The instance is lazily initialized and authenticated on first use.
 * If authentication fails or expires, it will re-authenticate automatically.
 *
 * @returns A Promise that resolves to an authenticated admin PocketBase instance
 * @throws Error if ADMIN_USER or ADMIN_PASSWORD environment variables are not set
 */
export async function getAdminPocketBase(): Promise<PocketBase> {
  // If we already have an authenticated instance, return it
  if (adminPb && adminPb.authStore.isValid && adminPb.authStore.isSuperuser) {
    return adminPb;
  }

  // If authentication is already in progress, wait for it
  if (adminAuthPromise) {
    return adminAuthPromise;
  }

  // Start authentication process
  adminAuthPromise = (async () => {
    try {
      // Reset admin instance if it exists but is invalid
      if (
        adminPb &&
        (!adminPb.authStore.isValid || !adminPb.authStore.isSuperuser)
      ) {
        adminPb = null;
      }

      // Create new instance if needed
      if (!adminPb) {
        adminPb = createPocketBase();
      }

      // Validate environment variables
      if (!ADMIN_USER || !ADMIN_PASSWORD) {
        throw new Error(
          'ADMIN_USER and ADMIN_PASSWORD environment variables must be set to use admin PocketBase instance'
        );
      }

      // Authenticate as admin superuser
      console.log('[getAdminPocketBase] Authenticating as admin superuser');
      await adminPb
        .collection('_superusers')
        .authWithPassword(ADMIN_USER, ADMIN_PASSWORD, {
          requestKey: crypto.randomUUID(),
        });

      if (!adminPb.authStore.isValid || !adminPb.authStore.isSuperuser) {
        throw new Error('Failed to authenticate as admin superuser');
      }

      console.log('[getAdminPocketBase] Successfully authenticated as admin');
      return adminPb;
    } catch (error) {
      // Reset state on error
      adminPb = null;
      adminAuthPromise = null;

      console.error('[getAdminPocketBase] Failed to authenticate as admin', {
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  })();

  return adminAuthPromise;
}

/**
 * Reset the admin PocketBase instance.
 * Useful for testing or when you need to force re-authentication.
 */
export function resetAdminPocketBase(): void {
  adminPb = null;
  adminAuthPromise = null;
}
