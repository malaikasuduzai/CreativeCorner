import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, requireAdminForParam } from '@/lib/apiAuth';

// By default only active packages are returned (what the public /packages
// page shows). Pass ?all=true from the admin panel to also see inactive
// (soft-deleted) packages so they can be reviewed or reactivated.
export async function GET(request) {
  const denied = await requireAdminForParam(request, 'all', 'true');
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';

    const packages = await prisma.package.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: { price: 'asc' },
    });
    return NextResponse.json({ count: packages.length, packages });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to fetch packages', error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { name, description, price, imageUrl, features } = body;

    if (!name || !description || !price) {
      return NextResponse.json(
        { message: 'Missing required fields: name, description, price' },
        { status: 400 }
      );
    }

    const pkg = await prisma.package.create({
      data: {
        name,
        description,
        price: Number(price),
        imageUrl: imageUrl || null,
        features: Array.isArray(features) ? features.join(', ') : features || null,
        active: true,
      },
    });

    return NextResponse.json(
      { message: 'Package created', package: pkg },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to create package', error: err.message },
      { status: 500 }
    );
  }
}
