import { getPB, getAPB, getUser } from '@/lib/data';
import { ADMIN_USER, ADMIN_PASSWORD } from 'astro:env/server';
// @ts-ignore
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async ({ locals, request }, next) => {
  locals.pb = getPB();
  locals.apb = getAPB();

  try {
    await locals.apb.admins.authWithPassword(ADMIN_USER, ADMIN_PASSWORD, {
      requestKey: Date.now().toString(),
    });
  } catch (e) {
    console.error('PB: Failed to authenticate as admin.', e.message);
  }

  // load the store data from the request cookie string
  locals.pb.authStore.loadFromCookie(request.headers.get('cookie') || '');

  try {
    // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
    if (locals.pb.authStore.isValid) {
      locals.user = await getUser();
    }
  } catch (_) {
    // clear the auth store on failed refresh
    locals.pb.authStore.clear();
  }

  const response = await next();

  // send back the default 'pb_auth' cookie to the client with the latest store state
  response.headers.append(
    'set-cookie',
    locals.pb.authStore.exportToCookie({
      secure: request.url.startsWith('https://'),
      httpOnly: false,
    })
  );

  return response;
});
