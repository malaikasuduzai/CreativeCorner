import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/apiAuth';

export async function GET(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = params;
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: Number(id) },
    });

    if (!inquiry) {
      return NextResponse.json({ message: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ inquiry });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to fetch inquiry', error: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = params;
    const body = await request.json();
    const { name, email, phone, subject, message, status } = body;

    const inquiry = await prisma.inquiry.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(subject !== undefined && { subject }),
        ...(message !== undefined && { message }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({ message: 'Inquiry updated', inquiry });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to update inquiry', error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = params;

    // Hard delete for inquiries
    const inquiry = await prisma.inquiry.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Inquiry deleted', inquiry });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to delete inquiry', error: err.message },
      { status: 500 }
    );
  }
}
