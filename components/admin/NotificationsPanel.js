"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/admin/Icon";

// Notification *history* — the full-history counterpart to the top-bar bell
// (components/admin/NotificationBell.js). The bell only ever shows the 8
// newest items and clears its badge the moment it's opened; this is the
// "backup", where nothing disappears just because you glanced at it.
//
// It renders as a block inside the Settings > Notifications card, directly
// below Notification Preferences — preferences decide which events are worth
// raising, this shows the ones that were.
const LIST_LIMIT = 50;

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

export default function NotificationsPanel() {
  const [filter, setFilter] = useState("unread"); // 'unread' | 'all'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marking, setMarking] = useState(false);

  const load = useCallback(async (activeFilter) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/notifications?filter=${activeFilter}&limit=${LIST_LIMIT}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load notifications");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  const markAllRead = async () => {
    setMarking(true);
    try {
      await fetch("/api/admin/notifications", { method: "POST" });
      await load(filter);
    } catch {
      // Non-fatal — the tab just won't reflect it until the next load.
    } finally {
      setMarking(false);
    }
  };

  const items = data?.items || [];
  const unreadTotal = data?.unread?.total || 0;
  const pendingBookings = data?.open?.pendingBookings || 0;
  const newInquiries = data?.open?.newInquiries || 0;

  return (
    <div className="cc-subsection" id="notification-history">
      <div className="cc-subsection-head">
        <span className="cc-subsection-icon">
          <Icon name="inbox" size={16} />
        </span>
        <span className="cc-subsection-title">
          Notification History
          {unreadTotal > 0 && <span className="cc-count-chip">{unreadTotal} new</span>}
        </span>
        <button
          type="button"
          className="btn btn-cc-read"
          onClick={markAllRead}
          disabled={marking || unreadTotal === 0}
          title={
            unreadTotal === 0
              ? "Nothing unread right now"
              : `Mark ${unreadTotal} notification(s) as read`
          }
        >
          <Icon name={marking ? "refresh" : "checkDouble"} size={16} />
          {marking ? "Marking…" : "Mark all as read"}
        </button>
      </div>

      <p className="cc-subsection-sub">
        Everything the bell has shown, kept until you mark it read.
      </p>

      <div className="cc-notif-toolbar">
        <div className="cc-notif-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={filter === "unread"}
            className={`cc-notif-tab ${filter === "unread" ? "active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Unread
            {unreadTotal > 0 && <span className="cc-tab-badge">{unreadTotal}</span>}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            className={`cc-notif-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
        </div>

        <div className="cc-notif-stats">
          <span className="cc-stat-pill booking">
            <span className="cc-stat-pill-num">{pendingBookings}</span>
            pending bookings
          </span>
          <span className="cc-stat-pill inquiry">
            <span className="cc-stat-pill-num">{newInquiries}</span>
            new inquiries
          </span>
        </div>
      </div>

      {error && (
        <div className="cc-alert err">
          <Icon name="alert" size={18} />
          <span>{error}</span>
        </div>
      )}

      {!error && loading && (
        <div className="cc-notif-list-static" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div className="cc-notif-skeleton" key={i}>
              <span className="cc-skeleton cc-skeleton-dot" />
              <span className="cc-notif-skeleton-lines">
                <span className="cc-skeleton" style={{ width: "42%" }} />
                <span className="cc-skeleton" style={{ width: "72%" }} />
              </span>
            </div>
          ))}
        </div>
      )}

      {!error && !loading && items.length === 0 && (
        <div className="cc-notif-empty-state">
          <span className="cc-notif-empty-icon">
            <Icon name={filter === "unread" ? "check" : "inbox"} size={24} />
          </span>
          <p className="cc-notif-empty-title">
            {filter === "unread" ? "You're all caught up" : "No notifications yet"}
          </p>
          <p className="cc-notif-empty-sub">
            {filter === "unread"
              ? "New bookings and inquiries will land here the moment they arrive."
              : "As soon as a client books or sends an inquiry, you'll see it here."}
          </p>
        </div>
      )}

      {!error && !loading && items.length > 0 && (
        <div className="cc-notif-list cc-notif-list-static">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`cc-notif-item ${item.unread ? "unread" : ""}`}
            >
              <span className={`cc-notif-dot ${item.type}`} aria-hidden="true" />
              <span className="cc-notif-item-body">
                <span className="cc-notif-item-title">
                  {item.title}
                  <span className="cc-notif-time">{timeAgo(item.createdAt)}</span>
                </span>
                <span className="cc-notif-item-text">{item.body}</span>
                <span className="cc-notif-item-foot">
                  {item.meta && <span className="cc-notif-item-meta">{item.meta}</span>}
                  {item.status && (
                    <span className={`cc-notif-status ${item.type}`}>{item.status}</span>
                  )}
                </span>
              </span>
              <span className="cc-notif-chevron" aria-hidden="true">
                ›
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
