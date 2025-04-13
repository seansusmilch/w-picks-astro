import { getPB, getAPB, getUser, cookieSettings } from '@/lib/data';
import { ADMIN_USER, ADMIN_PASSWORD } from 'astro:env/server';
import { POSTHOG_API_TOKEN } from 'astro:env/server';
import { defineMiddleware, sequence } from 'astro:middleware';
import { getLogger } from '@/lib/logger';

const logger = getLogger('middleware');

const auth = defineMiddleware(async ({ locals, request, cookies }, next) => {
  // Set default auth state
  locals.isAuthed = false;
  locals.user = null;

  // Authenticate Pocketbase
  locals.pb = getPB();
  locals.apb = getAPB();

  // Skip auth for cron jobs
  if (request.url.includes('/api/cron')) {
    return next();
  }

  try {
    if (!locals.apb.authStore.isValid || !locals.apb.authStore.isSuperuser) {
      await locals.apb
        .collection('_superusers')
        .authWithPassword(ADMIN_USER, ADMIN_PASSWORD, {
          requestKey: crypto.randomUUID(),
        });
    }
  } catch (e) {
    logger.error({ error: e }, 'PB: Failed to authenticate as admin');
  }

  // Clear any existing auth store before loading new cookie
  locals.pb.authStore.clear();

  // load the store data from the request cookie string
  const token = cookies.get('pb_auth');
  if (!token) {
    // Ensure user is explicitly not authenticated when token is missing
    locals.isAuthed = false;
    locals.user = null;
    logger.debug('PB: No auth token found, user not authenticated');
    return next();
  }

  locals.pb.authStore.save(token.value);

  try {
    // Verify and refresh the token first
    if (locals.pb.authStore.isValid) {
      locals.user = await getUser();
      locals.isAuthed = locals.pb.authStore.isValid;
      cookies.set(
        'pb_auth',
        locals.user.token,
        cookieSettings({
          requestUrl: request.url,
        })
      );

      logger.info(
        'PB: Authenticated as user',
        locals.isAuthed,
        locals.user.record.username
      );
    }
  } catch (_) {
    // clear the auth store on failed refresh
    locals.pb.authStore.clear();
    locals.isAuthed = false;
    locals.user = null;
    logger.debug('PB: Auth store cleared');
  }

  return next();
});

export const posthog = defineMiddleware(
  async ({ locals, request, cookies }, next) => {
    // Skip posthog for cron jobs
    if (request.url.includes('/api/cron')) {
      return next();
    }

    // get distinctId from posthog cookie
    let posthogCookie = cookies.get(`ph_${POSTHOG_API_TOKEN}_posthog`);
    let distinctId = posthogCookie?.json().distinct_id;
    if (!distinctId) {
      logger.debug('No distinctId found, generating new one');
      distinctId = crypto.randomUUID();
    }
    locals.distinctId = distinctId;

    return next();
  }
);

export const onRequest = sequence(auth, posthog);
