import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/apiAuth';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const event = await prisma.event.findUnique({
      where: { id: Number(id) },
    });

    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to fetch event', error: err.message },
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
    const { name, eventType, date, location, description, imageUrl, services, images, completed } = body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (eventType !== undefined) data.eventType = eventType;
    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (!Number.isNaN(parsedDate.getTime())) {
        data.date = parsedDate;
      }
    }
    if (location !== undefined) data.location = location;
    if (description !== undefined) data.description = description;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (services !== undefined) {
      data.services = Array.isArray(services) ? services.join(', ') : services;
    }
    if (images !== undefined) {
      data.images = Array.isArray(images) ? images.join(', ') : images;
    }
    if (completed !== undefined) data.completed = completed;

    const event = await prisma.event.update({
      where: { id: Number(id) },
      data,
    });

    return NextResponse.json({ message: 'Event updated', event });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to update event', error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = params;

    // Hard delete for events (no soft delete flag in schema)
    const event = await prisma.event.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Event deleted', event });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to delete event', error: err.message },
      { status: 500 }
    );
  }
}
