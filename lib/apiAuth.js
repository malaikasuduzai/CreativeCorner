import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSessionToken, ADMIN_SESSION_COOKIE } from '@/lib/auth';

// `middleware.js` only matches `/admin/:path*`, so it never runs for anything
// under `/api`. Until now the CRUD endpoints were protected only indirectly —
// by the fact that the admin pages calling them sit behind the middleware —
// which means anyone could hit them directly with curl. These helpers put the
// check on the route itself, where it belongs.

// Returns the decoded admin session payload, or null when there isn't a valid
// session cookie on the request.
export async function getAdminSession() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

// Guard for admin-only handlers. Returns a 401 NextResponse to return early
// with, or null when the caller is authenticated:
//
//   const denied = await requireAdmin();
//   if (denied) return denied;
//
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { message: 'Not authenticated. Admin sign-in required.' },
      { status: 401 }
    );
  }
  return null;
}

// Guard for endpoints that are public by default but expose extra data behind
// a query param — e.g. `GET /api/services?all=true` also returns deactivated
// records. Public callers omit the param and are let through untouched.
export async function requireAdminForParam(request, param, value = 'true') {
  const { searchParams } = new URL(request.url);
  if (searchParams.get(param) !== value) return null;
  return requireAdmin();
}
