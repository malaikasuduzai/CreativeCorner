import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/apiAuth';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const item = await prisma.galleryItem.findUnique({
      where: { id: Number(id) },
    });

    if (!item) {
      return NextResponse.json({ message: 'Gallery item not found' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to fetch gallery item', error: err.message },
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
    const { eventName, category, imageUrl, description, visible } = body;

    const item = await prisma.galleryItem.update({
      where: { id: Number(id) },
      data: {
        ...(eventName !== undefined && { eventName }),
        ...(category !== undefined && { category }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(description !== undefined && { description }),
        ...(visible !== undefined && { visible }),
      },
    });

    return NextResponse.json({ message: 'Gallery item updated', item });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to update gallery item', error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = params;

    // Permanent delete — removes the row entirely. Hiding an item (the
    // Show/Hide toggle, via PUT { visible }) is the reversible, non-destructive
    // action; this DELETE is the "actually remove it" action the admin
    // Delete button calls, so it does not stop at a soft delete.
    const item = await prisma.galleryItem.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Gallery item deleted', item });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to delete gallery item', error: err.message },
      { status: 500 }
    );
  }
}
