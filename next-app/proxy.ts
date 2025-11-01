import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createPocketBase } from './lib/pocketbase-server';

export async function proxy(request: NextRequest) {
  const pb = createPocketBase();
  const authCookie = request.cookies.get('pb_auth');

  if (authCookie) {
    try {
      const cookieString = `pb_auth=${authCookie.value}`;
      pb.authStore.loadFromCookie(cookieString);

      if (!pb.authStore.isValid) {
        pb.authStore.loadFromCookie(authCookie.value);
      }
    } catch {
      pb.authStore.clear();
    }

    if (pb.authStore.isValid) {
      try {
        await pb.collection('users').authRefresh();

        const response = NextResponse.next();
        const isSecure = request.nextUrl.protocol === 'https:';

        const authData = {
          token: pb.authStore.token,
          model: pb.authStore.model,
        };
        const cookieValue = JSON.stringify(authData);

        response.cookies.set('pb_auth', cookieValue, {
          httpOnly: true,
          secure: isSecure,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7 * 2, // 14 days
        });

        return response;
      } catch {
        pb.authStore.clear();
        const response = NextResponse.next();
        response.cookies.delete('pb_auth');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
