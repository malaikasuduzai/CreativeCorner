import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/apiAuth';
import { BOOKING_STATUSES } from '../route';
import { sendBookingStatusEmail } from '@/lib/mailer';

const EDITABLE_FIELDS = [
  'eventType',
  'eventName',
  'guestCount',
  'venue',
  'address',
  'city',
  'decorationRequirements',
  'cateringRequirements',
  'photographyRequirements',
  'stageRequirements',
  'lightingRequirements',
  'specialInstructions',
  'status',
];

export async function GET(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ message: 'Invalid booking id' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { client: true, package: true },
    });

    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (err) {
    return NextResponse.json({ message: 'Failed to fetch booking', error: err.message }, { status: 500 });
  }
}

// Handles both full edits and quick status-only updates (send just { status }).
export async function PUT(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ message: 'Invalid booking id' }, { status: 400 });
    }

    const existing = await prisma.booking.findUnique({
      where: { id },
      include: { client: true },
    });
    if (!existing) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    const body = await request.json();

    if (body.status !== undefined && !BOOKING_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { message: `Invalid status. Must be one of: ${BOOKING_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const data = {};
    for (const field of EDITABLE_FIELDS) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    if (data.guestCount !== undefined) {
      const guestCount = Number(data.guestCount);
      if (Number.isNaN(guestCount) || guestCount <= 0) {
        return NextResponse.json({ message: 'guestCount must be a positive number' }, { status: 400 });
      }
      data.guestCount = guestCount;
    }

    if (body.eventDate !== undefined) {
      const parsedDate = new Date(body.eventDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json({ message: 'Invalid eventDate' }, { status: 400 });
      }
      data.eventDate = parsedDate;
    }

    if (body.packageId !== undefined) {
      data.packageId = body.packageId === null ? null : Number(body.packageId);
    }

    const booking = await prisma.booking.update({
      where: { id },
      data,
      include: { client: true, package: true },
    });

    // Notify the client by email only when the status actually changed to
    // one of the two outcomes clients care about (Approve/Reject).
    const statusChanged = data.status !== undefined && data.status !== existing.status;
    if (statusChanged && (booking.status === 'Confirmed' || booking.status === 'Cancelled')) {
      try {
        await sendBookingStatusEmail({
          to: booking.client.email,
          bookingRef: booking.bookingRef,
          status: booking.status,
        });
      } catch (mailErr) {
        console.error('Failed to send booking status email:', mailErr.message);
      }
    }

    return NextResponse.json({ message: 'Booking updated', booking });
  } catch (err) {
    return NextResponse.json({ message: 'Failed to update booking', error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ message: 'Invalid booking id' }, { status: 400 });
    }

    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    await prisma.booking.delete({ where: { id } });

    return NextResponse.json({ message: 'Booking deleted' });
  } catch (err) {
    return NextResponse.json({ message: 'Failed to delete booking', error: err.message }, { status: 500 });
  }
}
