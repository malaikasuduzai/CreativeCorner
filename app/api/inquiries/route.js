import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/apiAuth';

export async function GET(request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = {};
    if (status) {
      where.status = status;
    }

    const inquiries = await prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ count: inquiries.length, inquiries });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to fetch inquiries', error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'Missing required fields: name, email, subject, message' },
        { status: 400 }
      );
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: 'New',
      },
    });

    return NextResponse.json(
      { message: 'Inquiry created', inquiry },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to create inquiry', error: err.message },
      { status: 500 }
    );
  }
}
