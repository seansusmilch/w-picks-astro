import { POCKETBASE_PUBLIC_URL } from 'astro:env/client';
import PocketBase, {
  type RecordAuthResponse,
  type RecordModel,
} from 'pocketbase';

let pb: PocketBase;
let user: RecordAuthResponse<RecordModel>;

/**
 * User authenticated PocketBase instance
 */
export function getPB() {
  if (!pb) {
    pb = new PocketBase(POCKETBASE_PUBLIC_URL);
    pb.authStore.loadFromCookie(document.cookie);
  }
  return pb;
}

/**
 * Get the current user
 */
export async function getUser() {
  try {
    // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
    if (pb.authStore.isValid) {
      user = await pb.collection('users').authRefresh();
      return user;
    }
  } catch (_) {
    // clear the auth store on failed refresh
    pb.authStore.clear();
  }
}
