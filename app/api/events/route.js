import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/apiAuth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');
    const completed = searchParams.get('completed');

    const where = {};
    if (eventType) {
      where.eventType = eventType;
    }
    if (completed !== null) {
      where.completed = completed === 'true';
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ count: events.length, events });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to fetch events', error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { name, eventType, date, location, description, imageUrl, services, images } = body;

    if (!name || !eventType || !date || !location) {
      return NextResponse.json(
        { message: 'Missing required fields: name, eventType, date, location' },
        { status: 400 }
      );
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ message: 'Invalid date' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        name,
        eventType,
        date: parsedDate,
        location,
        description: description || null,
        imageUrl: imageUrl || null,
        services: Array.isArray(services) ? services.join(', ') : services || null,
        images: Array.isArray(images) ? images.join(', ') : images || null,
        completed: false,
      },
    });

    return NextResponse.json(
      { message: 'Event created', event },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to create event', error: err.message },
      { status: 500 }
    );
  }
}
