import { getPB, getAPB, getUser } from '@/lib/data';
import { ADMIN_USER, ADMIN_PASSWORD, ENVIRONMENT } from 'astro:env/server';
import { POSTHOG_API_TOKEN } from 'astro:env/server';
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(
  async ({ locals, request, cookies }, next) => {
    // Skip middleware for cron jobs
    if (request.url.includes('/api/cron')) {
      if (ENVIRONMENT !== 'production') {
        return new Response('Cron jobs are only enabled in production', {
          status: 403,
        });
      }
      return next();
    }

    // get distinctId from posthog cookie
    let posthogCookie = cookies.get(`ph_${POSTHOG_API_TOKEN}_posthog`);
    let distinctId = posthogCookie?.json().distinct_id;
    if (!distinctId) {
      console.log('No distinctId found, generating new one');
      distinctId = crypto.randomUUID();
    }
    locals.distinctId = distinctId;

    // Set default auth state
    locals.isAuthed = false;
    locals.user = null;

    // Authenticate Pocketbase
    locals.pb = getPB();
    locals.apb = getAPB();

    try {
      await locals.apb
        .collection('_superusers')
        .authWithPassword(ADMIN_USER, ADMIN_PASSWORD, {
          requestKey: crypto.randomUUID(),
        });
    } catch (e) {
      console.error('PB: Failed to authenticate as admin.', e.message);
    }

    // Clear any existing auth store before loading new cookie
    locals.pb.authStore.clear();

    // load the store data from the request cookie string
    const cookieString = request.headers.get('cookie') || '';
    locals.pb.authStore.loadFromCookie(cookieString);

    try {
      // Verify and refresh the token first
      if (locals.pb.authStore.isValid) {
        locals.user = await getUser();
        locals.isAuthed = locals.pb.authStore.isValid;
        console.log(
          'PB: Authenticated as user',
          locals.isAuthed,
          locals.user?.record.username
        );
      }
    } catch (_) {
      // clear the auth store on failed refresh
      locals.pb.authStore.clear();
      locals.isAuthed = false;
      locals.user = null;
      console.log('PB: Auth store cleared');
    }

    const response = await next();

    // Only set the cookie if the auth store is valid
    if (locals.pb.authStore.isValid) {
      response.headers.append(
        'set-cookie',
        locals.pb.authStore.exportToCookie({
          secure: request.url.startsWith('https://'),
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
        })
      );
    }

    return response;
  }
);
