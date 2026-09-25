import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/apiAuth';
import { sendBookingReceivedEmail } from '@/lib/mailer';

export const BOOKING_STATUSES = [
  'Pending',
  'Under Review',
  'Confirmed',
  'In Progress',
  'Completed',
  'Cancelled',
];

function makeBookingRef() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CC-${stamp}-${rand}`;
}

// Admin list view supports search + filters via query params:
//   ?q=            free-text search across bookingRef, event name, client name/email/phone
//   ?status=       exact status match (Pending, Under Review, Confirmed, In Progress, Completed, Cancelled)
//   ?eventType=    exact event type match
//   ?packageId=    exact package id match
//   ?client=       partial match against the client's full name (dedicated client filter)
//   ?city=         partial, case-insensitive city match
//   ?dateFrom=     eventDate >= this ISO date
//   ?dateTo=       eventDate <= this ISO date
export async function GET(request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const status = searchParams.get('status');
    const eventType = searchParams.get('eventType');
    const packageId = searchParams.get('packageId');
    const client = searchParams.get('client')?.trim();
    const city = searchParams.get('city');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const where = {};

    if (status) where.status = status;
    if (eventType) where.eventType = eventType;
    if (packageId) where.packageId = Number(packageId);
    if (client) where.client = { fullName: { contains: client } };
    if (city) where.city = { contains: city };

    if (dateFrom || dateTo) {
      where.eventDate = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (!Number.isNaN(from.getTime())) where.eventDate.gte = from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        if (!Number.isNaN(to.getTime())) where.eventDate.lte = to;
      }
    }

    if (q) {
      where.OR = [
        { bookingRef: { contains: q } },
        { eventName: { contains: q } },
        { venue: { contains: q } },
        { client: { fullName: { contains: q } } },
        { client: { email: { contains: q } } },
        { client: { phone: { contains: q } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: { client: true, package: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ count: bookings.length, bookings });
  } catch (err) {
    return NextResponse.json({ message: 'Failed to fetch bookings', error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      eventType,
      eventName,
      eventDate,
      guestCount,
      packageName,
      venue,
      address,
      city,
      decorationRequirements,
      cateringRequirements,
      photographyRequirements,
      stageRequirements,
      lightingRequirements,
      specialInstructions,
      fullName,
      phone,
      email,
      whatsapp,
    } = body;

    const missing = [];
    if (!eventType) missing.push('eventType');
    if (!guestCount) missing.push('guestCount');
    if (!eventDate) missing.push('eventDate');
    if (!venue) missing.push('venue');
    if (!address) missing.push('address');
    if (!city) missing.push('city');
    if (!fullName) missing.push('fullName');
    if (!phone) missing.push('phone');
    if (!email) missing.push('email');

    if (missing.length > 0) {
      return NextResponse.json(
        { message: `Missing required field(s): ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    const parsedDate = new Date(eventDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ message: 'Invalid eventDate' }, { status: 400 });
    }

    // Reuse an existing client record by email when we have one, otherwise
    // create a new client so every booking is tied to a Client row.
    let client = await prisma.client.findFirst({ where: { email } });
    if (client) {
      client = await prisma.client.update({
        where: { id: client.id },
        data: { fullName, phone, whatsapp: whatsapp || client.whatsapp || null },
      });
    } else {
      client = await prisma.client.create({
        data: { fullName, phone, email, whatsapp: whatsapp || null },
      });
    }

    // Packages are seeded via the admin panel; if the chosen package doesn't
    // exist yet in the database, we still save the booking without a link.
    let pkg = null;
    if (packageName) {
      pkg = await prisma.package.findFirst({ where: { name: packageName } });
    }

    const booking = await prisma.booking.create({
      data: {
        bookingRef: makeBookingRef(),
        clientId: client.id,
        eventType,
        eventName: eventName || null,
        eventDate: parsedDate,
        guestCount: Number(guestCount),
        packageId: pkg ? pkg.id : null,
        venue,
        address,
        city,
        decorationRequirements: decorationRequirements || null,
        cateringRequirements: cateringRequirements || null,
        photographyRequirements: photographyRequirements || null,
        stageRequirements: stageRequirements || null,
        lightingRequirements: lightingRequirements || null,
        specialInstructions: specialInstructions || null,
        status: 'Pending',
      },
      include: { client: true, package: true },
    });

    // Best-effort: a booking should still succeed even if the confirmation
    // email fails to send (e.g. mailer not configured yet).
    try {
      await sendBookingReceivedEmail({
        to: booking.client.email,
        bookingRef: booking.bookingRef,
        eventType: booking.eventType,
        eventDate: booking.eventDate,
      });
    } catch (mailErr) {
      console.error('Failed to send booking received email:', mailErr.message);
    }

    return NextResponse.json(
      { message: 'Booking created', booking },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to create booking', error: err.message },
      { status: 500 }
    );
  }
}
