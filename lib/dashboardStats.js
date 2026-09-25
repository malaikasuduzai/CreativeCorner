import { prisma } from "@/lib/db";
import { BOOKING_STATUSES } from "@/lib/bookingStatus";

const RECENT_BOOKINGS_LIMIT = 6;
const UPCOMING_EVENTS_LIMIT = 6;

export async function getDashboardStats() {
  const now = new Date();

  const [
    totalBookings,
    pendingBookings,
    confirmedEvents,
    completedEvents,
    upcomingEventsCount,
    totalClients,
    totalServices,
    totalPackages,
    totalGalleryItems,
    statusCounts,
    recentBookings,
    upcomingBookings,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "Pending" } }),
    prisma.booking.count({ where: { status: "Confirmed" } }),
    prisma.booking.count({ where: { status: "Completed" } }),
    prisma.booking.count({
      where: { eventDate: { gte: now }, status: { notIn: ["Cancelled", "Completed"] } },
    }),
    prisma.client.count(),
    prisma.service.count({ where: { active: true } }),
    prisma.package.count({ where: { active: true } }),
    prisma.galleryItem.count({ where: { visible: true } }),
    Promise.all(
      BOOKING_STATUSES.map((status) =>
        prisma.booking.count({ where: { status } }).then((count) => ({ status, count }))
      )
    ),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: RECENT_BOOKINGS_LIMIT,
      include: { client: true, package: true },
    }),
    prisma.booking.findMany({
      where: { eventDate: { gte: now }, status: { notIn: ["Cancelled", "Completed"] } },
      orderBy: { eventDate: "asc" },
      take: UPCOMING_EVENTS_LIMIT,
      include: { client: true, package: true },
    }),
  ]);

  return {
    cards: {
      totalBookings,
      pendingBookings,
      confirmedEvents,
      upcomingEvents: upcomingEventsCount,
      completedEvents,
      totalClients,
      totalServices,
      totalPackages,
      totalGalleryItems,
    },
    statusCounts,
    recentBookings,
    upcomingBookings,
  };
}
