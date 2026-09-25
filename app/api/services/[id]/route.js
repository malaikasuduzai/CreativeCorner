import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/apiAuth';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const service = await prisma.service.findUnique({
      where: { id: Number(id) },
    });

    if (!service) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to fetch service', error: err.message },
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
    const { name, description, price, imageUrl, features, active } = body;

    const service = await prisma.service.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: price ? Number(price) : null }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(features !== undefined && {
          features: Array.isArray(features) ? features.join(', ') : features,
        }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json({ message: 'Service updated', service });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to update service', error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = params;

    // Soft delete by setting active to false
    const service = await prisma.service.update({
      where: { id: Number(id) },
      data: { active: false },
    });

    return NextResponse.json({ message: 'Service deleted', service });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to delete service', error: err.message },
      { status: 500 }
    );
  }
}
