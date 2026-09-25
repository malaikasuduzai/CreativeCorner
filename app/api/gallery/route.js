import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, requireAdminForParam } from '@/lib/apiAuth';

// ?all=true returns hidden items too (used by the admin Gallery page).
// Public pages never pass this, so they only ever see visible items.
export async function GET(request) {
  const denied = await requireAdminForParam(request, 'all', 'true');
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const all = searchParams.get('all') === 'true';

    const where = all ? {} : { visible: true };
    if (category) {
      where.category = category;
    }

    const items = await prisma.galleryItem.findMany({
      where,
      orderBy: { id: 'desc' },
    });

    return NextResponse.json({ count: items.length, items });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to fetch gallery items', error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { eventName, category, imageUrl, description } = body;

    if (!eventName || !category || !imageUrl) {
      return NextResponse.json(
        { message: 'Missing required fields: eventName, category, imageUrl' },
        { status: 400 }
      );
    }

    const item = await prisma.galleryItem.create({
      data: {
        eventName,
        category,
        imageUrl,
        description: description || null,
        visible: true,
      },
    });

    return NextResponse.json(
      { message: 'Gallery item created', item },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to create gallery item', error: err.message },
      { status: 500 }
    );
  }
}
