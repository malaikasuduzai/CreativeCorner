import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSessionToken, ADMIN_SESSION_COOKIE } from '@/lib/auth';

export async function GET() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  const payload = await verifyAdminSessionToken(token);

  if (!payload) {
    return NextResponse.json({ admin: null }, { status: 200 });
  }

  return NextResponse.json({ admin: { email: payload.email } });
}
