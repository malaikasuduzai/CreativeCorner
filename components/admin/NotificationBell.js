"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// How often the bell re-checks for new bookings/inquiries. Polling keeps this
// dependency-free — no websockets or third-party realtime service needed for
// what is, in practice, a low-traffic admin panel.
const POLL_INTERVAL_MS = 30000;

function timeAgo(value) {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}

export default function NotificationBell() {
  const pathname = usePathname();
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const wrapRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) return;
      setData(await res.json());
    } catch {
      // Silent — a failed poll shouldn't put an error banner in the top bar.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  // Re-check on navigation too, so acting on a booking updates the counts
  // right away instead of waiting out the poll interval.
  useEffect(() => {
    load();
    setOpen(false);
  }, [pathname, load]);

  // Close when clicking outside the dropdown or pressing Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = data?.unread?.total || 0;
  const items = data?.items || [];

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    // Opening the panel clears the unread badge. The items themselves stay in
    // the list — the badge is about "since you last looked", not about whether
    // the booking has been handled.
    if (next && unread > 0) {
      setData((d) => (d ? { ...d, unread: { bookings: 0, inquiries: 0, total: 0 } } : d));
      try {
        await fetch("/api/admin/notifications", { method: "POST" });
      } catch {
        // If the mark-as-read call fails the next poll simply restores the badge.
      }
    }
  };

  return (
    <div className="cc-notif-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`cc-notif-bell ${open ? "open" : ""}`}
        onClick={toggle}
        aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span aria-hidden="true">🔔</span>
        {unread > 0 && (
          <span className="cc-notif-badge">{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {open && (
        <div className="cc-notif-panel" role="menu">
          <div className="cc-notif-panel-head">
            <span className="fw-semibold">Notifications</span>
            <span className="small text-muted-soft">
              {loading ? "Loading…" : `${items.length} recent`}
            </span>
          </div>

          {(data?.open?.pendingBookings > 0 || data?.open?.newInquiries > 0) && (
            <div className="cc-notif-summary">
              {data.open.pendingBookings > 0 && (
                <Link href="/admin/bookings" className="cc-notif-chip">
                  {data.open.pendingBookings} pending booking
                  {data.open.pendingBookings === 1 ? "" : "s"}
                </Link>
              )}
              {data.open.newInquiries > 0 && (
                <Link href="/admin/inquiries" className="cc-notif-chip">
                  {data.open.newInquiries} new inquir
                  {data.open.newInquiries === 1 ? "y" : "ies"}
                </Link>
              )}
            </div>
          )}

          <div className="cc-notif-list">
            {!loading && items.length === 0 && (
              <div className="cc-notif-empty">Nothing new right now.</div>
            )}
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`cc-notif-item ${item.unread ? "unread" : ""}`}
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                <span
                  className={`cc-notif-dot ${item.type}`}
                  aria-hidden="true"
                />
                <span className="cc-notif-item-body">
                  <span className="cc-notif-item-title">
                    {item.title}
                    <span className="cc-notif-time">{timeAgo(item.createdAt)}</span>
                  </span>
                  <span className="cc-notif-item-text">{item.body}</span>
                  {item.meta && (
                    <span className="cc-notif-item-meta">{item.meta}</span>
                  )}
                </span>
              </Link>
            ))}
          </div>

          <div className="cc-notif-panel-foot">
            <Link href="/admin/bookings" onClick={() => setOpen(false)}>
              All bookings
            </Link>
            <Link href="/admin/inquiries" onClick={() => setOpen(false)}>
              All inquiries
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
