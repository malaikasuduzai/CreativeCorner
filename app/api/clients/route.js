import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/apiAuth';

// Admin list view supports search via query param:
//   ?email=   exact email match (used by the booking flow to look up an existing client)
//   ?q=       free-text search across fullName, email, phone (used by the admin Clients page)
export async function GET(request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const q = searchParams.get('q')?.trim();

    const where = {};
    if (email) {
      where.email = email;
    }
    if (q) {
      where.OR = [
        { fullName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      include: { bookings: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ count: clients.length, clients });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to fetch clients', error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { fullName, email, phone, whatsapp } = body;

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { message: 'Missing required fields: fullName, email, phone' },
        { status: 400 }
      );
    }

    // Check if client already exists
    const existingClient = await prisma.client.findFirst({
      where: { email },
    });

    if (existingClient) {
      return NextResponse.json(
        { message: 'Client with this email already exists', client: existingClient },
        { status: 409 }
      );
    }

    const client = await prisma.client.create({
      data: {
        fullName,
        email,
        phone,
        whatsapp: whatsapp || null,
      },
      include: { bookings: true },
    });

    return NextResponse.json(
      { message: 'Client created', client },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to create client', error: err.message },
      { status: 500 }
    );
  }
}
