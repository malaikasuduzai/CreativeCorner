import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/apiAuth';
import { getSettings } from '@/lib/settings';

// GET /api/bookings/availability?date=YYYY-MM-DD
// Lets the public booking wizard (spec section 13) flag that a chosen date is
// already busy and may need admin confirmation. Cancelled bookings don't count
// against a date's availability, and the per-day capacity comes from the
// `maxBookingsPerDay` admin setting.
//
// This endpoint stays public because the booking form calls it before a client
// has any session — so it only ever returns a count. The individual booking
// rows (refs, venues, other clients' event types) are included for admins only.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ message: 'date query param is required' }, { status: 400 });
    }

    const dayStart = new Date(date);
    if (Number.isNaN(dayStart.getTime())) {
      return NextResponse.json({ message: 'Invalid date' }, { status: 400 });
    }
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const [bookings, settings, session] = await Promise.all([
      prisma.booking.findMany({
        where: {
          eventDate: { gte: dayStart, lt: dayEnd },
          status: { not: 'Cancelled' },
        },
        select: { id: true, bookingRef: true, eventType: true, venue: true, status: true },
      }),
      getSettings(),
      getAdminSession(),
    ]);

    const capacity = Math.max(1, Number(settings.maxBookingsPerDay) || 1);

    return NextResponse.json({
      date,
      capacity,
      available: bookings.length < capacity,
      count: bookings.length,
      // Only an authenticated admin sees who else is booked that day.
      bookings: session ? bookings : undefined,
    });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to check availability', error: err.message },
      { status: 500 }
    );
  }
}
