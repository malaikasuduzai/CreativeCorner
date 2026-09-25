import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSessionToken, ADMIN_SESSION_COOKIE } from '@/lib/auth';
import { getDashboardStats } from '@/lib/dashboardStats';

export async function GET() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(token);
  if (!session) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to load dashboard stats', error: err.message },
      { status: 500 }
    );
  }
}
