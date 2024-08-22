import PocketBase from 'pocketbase';
import { POCKETBASE_URL, ADMIN_USER, ADMIN_PASSWORD } from 'astro:env/server';
import { defineMiddleware } from 'astro/middleware';

export const onRequest = defineMiddleware(async ({ locals, request }, next) => {
  console.log('POCKETBASE_URL:', POCKETBASE_URL);
  locals.pb = new PocketBase(POCKETBASE_URL);
  locals.apb = new PocketBase(POCKETBASE_URL);

  try {
    locals.apb = await locals.apb.admins.authWithPassword(
      ADMIN_USER,
      ADMIN_PASSWORD
    );
  } catch {
    console.error('PB: Failed to authenticate as admin');
  }

  // load the store data from the request cookie string
  locals.pb.authStore.loadFromCookie(request.headers.get('cookie') || '');

  try {
    // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
    if (locals.pb.authStore.isValid) {
      locals.user = await locals.pb.collection('users').authRefresh();
    }
  } catch (_) {
    // clear the auth store on failed refresh
    locals.pb.authStore.clear();
  }

  const response = await next();

  // send back the default 'pb_auth' cookie to the client with the latest store state
  response.headers.append('set-cookie', locals.pb.authStore.exportToCookie());

  return response;
});
