import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/apiAuth';

export async function GET(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = params;
    const client = await prisma.client.findUnique({
      where: { id: Number(id) },
      include: { bookings: true },
    });

    if (!client) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to fetch client', error: err.message },
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
    const { fullName, phone, whatsapp } = body;

    const client = await prisma.client.update({
      where: { id: Number(id) },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(phone !== undefined && { phone }),
        ...(whatsapp !== undefined && { whatsapp }),
      },
      include: { bookings: true },
    });

    return NextResponse.json({ message: 'Client updated', client });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to update client', error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = params;

    // Check if client has bookings before deleting
    const bookingCount = await prisma.booking.count({
      where: { clientId: Number(id) },
    });

    if (bookingCount > 0) {
      return NextResponse.json(
        { message: `Cannot delete client with ${bookingCount} associated booking(s)` },
        { status: 409 }
      );
    }

    const client = await prisma.client.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Client deleted', client });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to delete client', error: err.message },
      { status: 500 }
    );
  }
}
