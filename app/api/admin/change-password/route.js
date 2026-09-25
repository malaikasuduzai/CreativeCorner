import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/apiAuth';

// POST /api/admin/change-password
// Lets a signed-in admin change their own password from Settings, without
// going through the emailed reset-link flow. The current password is still
// required so a borrowed browser session can't lock the real admin out.
export async function POST(request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { message: 'Not authenticated. Admin sign-in required.' },
      { status: 401 }
    );
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current and new password are both required' },
        { status: 400 }
      );
    }
    if (String(newPassword).length < 8) {
      return NextResponse.json(
        { message: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { message: 'New password must be different from the current one' },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({ where: { id: Number(session.sub) } });
    if (!admin) {
      return NextResponse.json({ message: 'Admin account not found' }, { status: 404 });
    }

    const matches = await bcrypt.compare(String(currentPassword), admin.password);
    if (!matches) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        password: await bcrypt.hash(String(newPassword), 10),
        // Any outstanding reset link is void once the password changes.
        resetTokenHash: null,
        resetTokenExpires: null,
      },
    });

    return NextResponse.json({ message: 'Password updated' });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to change password', error: err.message },
      { status: 500 }
    );
  }
}
