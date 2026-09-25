import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import {
  createAdminSessionToken,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_COOKIE_OPTIONS,
} from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    // Same generic message whether the email doesn't exist or the password
    // is wrong, so a bad actor can't use the response to enumerate accounts.
    if (!admin) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(password, admin.password);
    if (!passwordMatches) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = await createAdminSessionToken({ id: admin.id, email: admin.email });

    const res = NextResponse.json({
      message: 'Login successful',
      admin: { id: admin.id, email: admin.email },
    });
    res.cookies.set(ADMIN_SESSION_COOKIE, token, ADMIN_SESSION_COOKIE_OPTIONS);
    return res;
  } catch (err) {
    return NextResponse.json(
      { message: 'Login failed', error: err.message },
      { status: 500 }
    );
  }
}
