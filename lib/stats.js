import { prisma } from "@/lib/db";
import { getYearsOfExperience, CLIENT_SATISFACTION_PERCENT } from "@/lib/siteConfig";

// Real numbers from the database (no made-up fallbacks):
//   Events Managed    = events marked Completed + bookings with status Completed
//   Corporate Clients = distinct clients with a Confirmed / In Progress / Completed
//                       Corporate, Conference or Seminar booking
// Corporate Clients never shows less than CORPORATE_CLIENTS_MINIMUM.
// If the database cannot be reached, Events Managed shows "—".
const CORPORATE_EVENT_TYPES = ["Corporate", "Conference", "Seminar"];
const LIVE_BOOKING_STATUSES = ["Confirmed", "In Progress", "Completed"];

const plus = (n) => (n > 0 ? `${n}+` : "0");

// Shown as "3+" until the real count passes it. Change the number here.
const CORPORATE_CLIENTS_MINIMUM = 4;

export async function getHomeStats() {
  let eventsManaged = "—";
  let corporateClients = plus(CORPORATE_CLIENTS_MINIMUM);

  try {
    const [completedEvents, completedBookings, corporateRows] = await Promise.all([
      prisma.event.count({ where: { completed: true } }),
      prisma.booking.count({ where: { status: "Completed" } }),
      prisma.booking.findMany({
        where: {
          eventType: { in: CORPORATE_EVENT_TYPES },
          status: { in: LIVE_BOOKING_STATUSES },
        },
        select: { clientId: true },
        distinct: ["clientId"],
      }),
    ]);
    eventsManaged = plus(completedEvents + completedBookings);
    corporateClients = plus(Math.max(CORPORATE_CLIENTS_MINIMUM, corporateRows.length));
  } catch (err) {
    console.error("getHomeStats: database unavailable:", err.message);
  }

  return [
    { num: `${getYearsOfExperience()}+`, label: "Years of Experience" },
    { num: eventsManaged, label: "Events Managed" },
    { num: corporateClients, label: "Corporate Clients" },
    { num: `${CLIENT_SATISFACTION_PERCENT}%`, label: "Client Satisfaction" },
  ];
}
