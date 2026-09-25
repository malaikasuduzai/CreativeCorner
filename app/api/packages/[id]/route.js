import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/apiAuth';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const pkg = await prisma.package.findUnique({
      where: { id: Number(id) },
    });

    if (!pkg) {
      return NextResponse.json({ message: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json({ package: pkg });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to fetch package', error: err.message },
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

    const pkg = await prisma.package.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(features !== undefined && {
          features: Array.isArray(features) ? features.join(', ') : features,
        }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json({ message: 'Package updated', package: pkg });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to update package', error: err.message },
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
    const pkg = await prisma.package.update({
      where: { id: Number(id) },
      data: { active: false },
    });

    return NextResponse.json({ message: 'Package deleted', package: pkg });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to delete package', error: err.message },
      { status: 500 }
    );
  }
}
