import { NextResponse } from 'next/server';
import { verifyAdminSessionToken, ADMIN_SESSION_COOKIE } from '@/lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(token);

  // Public admin auth pages: sign in, and the forgot/reset password flow.
  // None of these should require an existing session.
  const isPublicAuthPage =
    pathname === '/admin/login' ||
    pathname === '/admin/forgot-password' ||
    pathname === '/admin/reset-password';

  if (isPublicAuthPage) {
    // Already signed in — no need to see the login form again. (Reset/forgot
    // pages stay accessible even when signed in, e.g. resetting a different
    // admin's password from a shared link.)
    if (session && pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Every other /admin route requires a valid session.
  if (!session) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
