"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/admin/StatusBadge";
import Icon from "@/components/Icon";
import { BOOKING_STATUSES } from "@/lib/bookingStatus";

const STATUS_COLORS = {
  Pending: "#d9a441",
  "Under Review": "#5165d1",
  Confirmed: "#2f9e57",
  "In Progress": "#1f8fb3",
  Completed: "#8a7c5c",
  Cancelled: "#c1443b",
};

const CARD_DEFS = [
  { key: "totalBookings", label: "Total Bookings", icon: "clipboardList", accent: "#b8863f" },
  { key: "pendingBookings", label: "Pending Bookings", icon: "clock", accent: "#d9a441" },
  { key: "confirmedEvents", label: "Confirmed Events", icon: "checkCircle", accent: "#2f9e57" },
  { key: "upcomingEvents", label: "Upcoming Events", icon: "calendarDays", accent: "#1f8fb3" },
  { key: "completedEvents", label: "Completed Events", icon: "check", accent: "#8a7c5c" },
];

const CONTENT_CARD_DEFS = [
  { key: "totalClients", label: "Total Clients", icon: "users", accent: "#5165d1" },
  { key: "totalServices", label: "Total Services", icon: "settings2", accent: "#2f8f8a" },
  { key: "totalPackages", label: "Total Packages", icon: "package", accent: "#b8863f" },
  { key: "totalGalleryItems", label: "Total Gallery Items", icon: "image", accent: "#7a5fb0" },
];

// Converts a "#rrggbb" accent color into a soft rgba() background for the
// icon badge behind it, so each stat card's badge stays legible and on-brand
// without needing a second color defined by hand for every card.
function accentBg(hex, alpha = 0.14) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysUntil(value) {
  const diff = Math.ceil((new Date(value) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `In ${diff} days`;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/dashboard-stats");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load dashboard");
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxStatusCount = stats
    ? Math.max(1, ...stats.statusCounts.map((s) => s.count))
    : 1;

  return (
    <div className="container-fluid py-5 px-4">
      <div className="cc-admin-header">
        <div>
          <span className="eyebrow mb-1">Admin Panel</span>
          <h2>Dashboard</h2>
          <p>Here&apos;s an overview of your bookings, clients and events.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading && (
        <div className="row g-3">
          {[...Array(5)].map((_, i) => (
            <div className="col-6 col-md-4 col-lg" key={i}>
              <div className="cc-skeleton-card">
                <div className="cc-skeleton mb-2" style={{ width: 38, height: 38, borderRadius: 10 }}>
                  &nbsp;
                </div>
                <div className="cc-skeleton mb-2" style={{ width: "60%", height: 24 }}>
                  &nbsp;
                </div>
                <div className="cc-skeleton" style={{ width: "80%", height: 12 }}>
                  &nbsp;
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && stats && (
        <>
          {/* Bookings overview */}
          <div className="row g-3 mb-3">
            {CARD_DEFS.map((c) => (
              <div className="col-6 col-md-4 col-lg" key={c.key}>
                <div
                  className="cc-stat-card"
                  style={{ "--accent": c.accent, "--accent-bg": accentBg(c.accent) }}
                >
                  <div className="cc-stat-icon">
                    <Icon name={c.icon} size={18} />
                  </div>
                  <div className="cc-stat-value">{stats.cards[c.key]}</div>
                  <div className="cc-stat-label">{c.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Content overview */}
          <div className="row g-3 mb-4">
            {CONTENT_CARD_DEFS.map((c) => (
              <div className="col-6 col-md-3" key={c.key}>
                <div
                  className="cc-stat-card"
                  style={{ "--accent": c.accent, "--accent-bg": accentBg(c.accent) }}
                >
                  <div className="cc-stat-icon">
                    <Icon name={c.icon} size={18} />
                  </div>
                  <div className="cc-stat-value">{stats.cards[c.key]}</div>
                  <div className="cc-stat-label">{c.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            {/* Status breakdown chart */}
            <div className="col-lg-4">
              <div className="cc-admin-card p-4 h-100">
                <h6 className="cc-section-title mb-3">
                  <span className="cc-section-title-icon"><Icon name="sliders" size={14} /></span>
                  Bookings by Status
                </h6>
                <div className="d-flex flex-column gap-3">
                  {BOOKING_STATUSES.map((status) => {
                    const count =
                      stats.statusCounts.find((s) => s.status === status)?.count || 0;
                    const pct = Math.round((count / maxStatusCount) * 100);
                    return (
                      <div key={status}>
                        <div className="d-flex justify-content-between small mb-1">
                          <span>
                            <span
                              className="cc-status-dot"
                              style={{ background: STATUS_COLORS[status] }}
                            />
                            {status}
                          </span>
                          <span className="fw-semibold">{count}</span>
                        </div>
                        <div className="cc-bar-track">
                          <div
                            className="cc-bar-fill"
                            style={{
                              width: `${pct}%`,
                              background: STATUS_COLORS[status],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent bookings */}
            <div className="col-lg-8">
              <div className="cc-admin-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="cc-section-title mb-0">
                    <span className="cc-section-title-icon"><Icon name="clipboardList" size={14} /></span>
                    Recent Bookings
                  </h6>
                  <Link href="/admin/bookings" className="cc-section-link">
                    View all →
                  </Link>
                </div>
                <div className="table-responsive">
                  <table className="cc-admin-table mb-0">
                    <thead>
                      <tr>
                        <th>Booking Ref</th>
                        <th>Client</th>
                        <th>Event Type</th>
                        <th>Event Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentBookings.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-muted-soft">
                            No bookings yet.
                          </td>
                        </tr>
                      )}
                      {stats.recentBookings.map((b) => (
                        <tr key={b.id}>
                          <td>
                            <Link href={`/admin/bookings/${b.id}`} className="cc-admin-ref">
                              {b.bookingRef}
                            </Link>
                          </td>
                          <td>{b.client?.fullName || "—"}</td>
                          <td>{b.eventType}</td>
                          <td>{formatDate(b.eventDate)}</td>
                          <td>
                            <StatusBadge status={b.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming events */}
          <div className="cc-admin-card p-4 mt-4">
            <h6 className="cc-section-title mb-3">
              <span className="cc-section-title-icon"><Icon name="calendarDays" size={14} /></span>
              Upcoming Events
            </h6>
            {stats.upcomingBookings.length === 0 ? (
              <p className="text-muted-soft mb-0">No upcoming events scheduled.</p>
            ) : (
              <div className="row g-3">
                {stats.upcomingBookings.map((b) => (
                  <div className="col-md-6 col-xl-4" key={b.id}>
                    <div
                      className="cc-upcoming-card"
                      style={{ "--accent": STATUS_COLORS[b.status] || "var(--cc-gold)" }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="fw-semibold">{b.eventName || b.eventType}</div>
                          <div className="small text-muted-soft">{b.client?.fullName}</div>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                      <div className="cc-upcoming-meta">
                        <span>{formatDate(b.eventDate)}</span>
                        <span className="text-gold">{daysUntil(b.eventDate)}</span>
                      </div>
                      <div className="small text-muted-soft">{b.venue}, {b.city}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
