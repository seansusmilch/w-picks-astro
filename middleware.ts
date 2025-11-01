import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAPB } from '@/lib/data';
import PocketBase from 'pocketbase';

const POCKETBASE_URL = process.env.POCKETBASE_URL || '';

export async function middleware(request: NextRequest) {
  // Skip middleware for cron jobs
  if (request.nextUrl.pathname.startsWith('/api/cron')) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Initialize APB authentication early to ensure it's ready
  // This ensures admin authentication is set up for superuser operations
  try {
    await getAPB();
  } catch (error) {
    // Log error but don't block request - APB will authenticate on first use
    console.error('Failed to initialize APB in middleware:', error);
  }

  // Handle PocketBase user authentication
  // Load auth from cookie and refresh if valid, then sync back to response
  const pbAuthCookie = request.cookies.get('pb_auth');
  if (pbAuthCookie?.value) {
    try {
      const pb = new PocketBase(POCKETBASE_URL);
      
      // Load auth store from cookie
      pb.authStore.loadFromCookie(`pb_auth=${pbAuthCookie.value}`);
      
      // Refresh auth token if valid
      if (pb.authStore.isValid && pb.authStore.model) {
        try {
          await pb.collection('users').authRefresh();
          
          // Export updated cookie and sync to response
          const updatedCookie = pb.authStore.exportToCookie({
            httpOnly: true,
            secure: request.nextUrl.protocol === 'https:',
            sameSite: 'strict',
            path: '/',
            maxAge: 1209600, // 14 days
          });
          
          // Extract cookie value and set it in response
          const cookieValue = updatedCookie.split('pb_auth=')[1]?.split(';')[0];
          if (cookieValue) {
            response.cookies.set('pb_auth', cookieValue, {
              httpOnly: true,
              secure: request.nextUrl.protocol === 'https:',
              sameSite: 'strict',
              path: '/',
              maxAge: 1209600,
            });
          }
        } catch (error) {
          // Token invalid or expired, clear cookie
          response.cookies.delete('pb_auth');
        }
      }
    } catch (error) {
      // Invalid cookie format, clear it
      response.cookies.delete('pb_auth');
    }
  }

  // Handle PostHog distinctId cookie
  const posthogCookieName = `ph_${process.env.POSTHOG_API_TOKEN}_posthog`;
  const posthogCookie = request.cookies.get(posthogCookieName);

  if (!posthogCookie) {
    // Generate a new distinctId if none exists
    const distinctId = crypto.randomUUID();
    const cookieValue = JSON.stringify({ distinct_id: distinctId });
    response.cookies.set(posthogCookieName, cookieValue, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
