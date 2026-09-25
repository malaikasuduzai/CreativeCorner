import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingRef = searchParams.get('bookingRef')?.trim();

    if (!bookingRef) {
      return NextResponse.json({ message: 'Please enter your Booking Reference ID.' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { bookingRef },
      select: { bookingRef: true, eventType: true, eventDate: true, status: true },
    });

    if (!booking) {
      return NextResponse.json({ message: 'Booking not found. Please check your Booking Reference ID.' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (err) {
    return NextResponse.json({ message: 'Unable to track booking right now.' }, { status: 500 });
  }
}
