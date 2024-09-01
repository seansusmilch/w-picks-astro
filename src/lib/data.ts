import PocketBase, {
  type RecordAuthResponse,
  type RecordModel,
} from 'pocketbase';
import { POCKETBASE_URL } from 'astro:env/server';

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
  return pb;
}

/**
 * Admin authenticated PocketBase instance
 */
export function getAPB() {
  if (!apb) {
    apb = new PocketBase(POCKETBASE_URL);
  }
  return apb;
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
