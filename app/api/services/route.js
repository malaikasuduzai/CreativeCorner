import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, requireAdminForParam } from '@/lib/apiAuth';

// By default only active services are returned (what the public /services
// page shows). Pass ?all=true from the admin panel to also see inactive
// (soft-deleted) services so they can be reviewed or reactivated.
export async function GET(request) {
  const denied = await requireAdminForParam(request, 'all', 'true');
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';

    const services = await prisma.service.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ count: services.length, services });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to fetch services', error: err.message },
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

    if (!name || !description) {
      return NextResponse.json(
        { message: 'Missing required fields: name, description' },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: price ? Number(price) : null,
        imageUrl: imageUrl || null,
        // Accept either a comma-separated string or an array of strings.
        features: Array.isArray(features) ? features.join(', ') : features || null,
        active: true,
      },
    });

    return NextResponse.json(
      { message: 'Service created', service },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to create service', error: err.message },
      { status: 500 }
    );
  }
}
