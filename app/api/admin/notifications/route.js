import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/apiAuth';

const RECENT_LIMIT = 8;
const MAX_LIMIT = 200;

function unauthorized() {
  return NextResponse.json(
    { message: 'Not authenticated. Admin sign-in required.' },
    { status: 401 }
  );
}

// GET /api/admin/notifications
// GET /api/admin/notifications?filter=all&limit=50
// GET /api/admin/notifications?filter=unread&limit=50
//
// Returns unread counts plus a feed of bookings and inquiries. "Unread"
// means created after this admin last opened the panel
// (Admin.notificationsReadAt). On a brand new account that field is null, so
// everything currently open counts as unread — which is the behaviour you
// want on first login.
//
// `filter` and `limit` are optional and only widen what's returned — the bell
// dropdown calls this with no params and gets the original behaviour (8
// newest items, any read state) unchanged. The Settings > Notifications panel
// passes `filter=unread` / `filter=all` with a bigger `limit` for its "backup"
// full view.
export async function GET(request) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'unread' | 'all' | null
    const limitParam = parseInt(searchParams.get('limit'), 10);
    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(limitParam, MAX_LIMIT)
        : RECENT_LIMIT;

    const admin = await prisma.admin.findUnique({
      where: { id: Number(session.sub) },
      select: { notificationsReadAt: true },
    });

    const readAt = admin?.notificationsReadAt || null;
    const newerThan = readAt ? { gt: readAt } : undefined;

    // When only unread items are wanted, push that condition into the query
    // itself instead of fetching everything and filtering in memory — a
    // fresh account (readAt null) still has no condition, since nothing has
    // ever been marked read yet and everything counts as unread.
    const unreadOnlyWhere = newerThan ? { createdAt: newerThan } : {};
    const listWhere = filter === 'unread' ? unreadOnlyWhere : {};

    const [
      unreadBookings,
      unreadInquiries,
      pendingBookings,
      newInquiries,
      recentBookings,
      recentInquiries,
    ] = await Promise.all([
      prisma.booking.count({ where: unreadOnlyWhere }),
      prisma.inquiry.count({ where: unreadOnlyWhere }),
      // Standing counts — these don't reset when the panel is opened, they
      // only go down when the item is actually dealt with in the admin panel.
      prisma.booking.count({ where: { status: 'Pending' } }),
      prisma.inquiry.count({ where: { status: 'New' } }),
      prisma.booking.findMany({
        where: listWhere,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { fullName: true } } },
      }),
      prisma.inquiry.findMany({
        where: listWhere,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Merge both streams into one time-ordered feed for the dropdown.
    const items = [
      ...recentBookings.map((b) => ({
        id: `booking-${b.id}`,
        type: 'booking',
        title: 'New Booking',
        body: `${b.client?.fullName || 'A client'} — ${b.eventType}${
          b.eventName ? ` (${b.eventName})` : ''
        }`,
        meta: b.bookingRef,
        status: b.status,
        href: `/admin/bookings/${b.id}`,
        createdAt: b.createdAt,
        unread: readAt ? b.createdAt > readAt : true,
      })),
      ...recentInquiries.map((i) => ({
        id: `inquiry-${i.id}`,
        type: 'inquiry',
        title: 'New Inquiry',
        body: `${i.name} — ${i.subject}`,
        meta: i.email,
        status: i.status,
        href: '/admin/inquiries',
        createdAt: i.createdAt,
        unread: readAt ? i.createdAt > readAt : true,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    return NextResponse.json({
      unread: {
        bookings: unreadBookings,
        inquiries: unreadInquiries,
        total: unreadBookings + unreadInquiries,
      },
      open: {
        pendingBookings,
        newInquiries,
      },
      readAt,
      filter: filter === 'unread' ? 'unread' : 'all',
      items,
    });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to load notifications', error: err.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/notifications — marks everything up to now as read by
// stamping Admin.notificationsReadAt. Called when the bell dropdown opens.
export async function POST() {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    await prisma.admin.update({
      where: { id: Number(session.sub) },
      data: { notificationsReadAt: new Date() },
    });
    return NextResponse.json({ message: 'Notifications marked as read' });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to mark notifications as read', error: err.message },
      { status: 500 }
    );
  }
}
