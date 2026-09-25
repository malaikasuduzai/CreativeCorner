"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BOOKING_STATUSES } from "@/lib/bookingStatus";
import Icon from "@/components/Icon";

const EVENT_TYPES = [
  "Wedding",
  "Corporate",
  "Birthday",
  "Engagement",
  "Conference",
  "Seminar",
  "Private Party",
  "Bridal",
];

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [packages, setPackages] = useState([]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [eventType, setEventType] = useState("");
  const [packageId, setPackageId] = useState("");
  const [client, setClient] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/packages");
        const data = await res.json();
        if (res.ok) setPackages(data.packages || []);
      } catch {
        // Non-fatal — the package filter just won't have options.
      }
    })();
  }, []);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    if (eventType) params.set("eventType", eventType);
    if (packageId) params.set("packageId", packageId);
    if (client.trim()) params.set("client", client.trim());
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    return params.toString();
  }, [q, status, eventType, packageId, client, dateFrom, dateTo]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/bookings${queryString ? `?${queryString}` : ""}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load bookings");
        setBookings(data.bookings || []);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce so typing in search doesn't fire a request per keystroke

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [queryString]);

  const clearFilters = () => {
    setQ("");
    setStatus("");
    setEventType("");
    setPackageId("");
    setClient("");
    setDateFrom("");
    setDateTo("");
  };

  const hasFilters = q || status || eventType || packageId || client || dateFrom || dateTo;

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    const previous = bookings;
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setBookings(previous); // revert on failure
      setError("Couldn't update status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  // One-click Approve/Reject (spec section 17) — shortcuts on top of the
  // generic status dropdown for the two most common admin actions.
  const handleApprove = (id) => handleStatusChange(id, "Confirmed");
  const handleReject = (id) => handleStatusChange(id, "Cancelled");

  const handleDelete = async (id, ref) => {
    if (!window.confirm(`Delete booking ${ref}? This can't be undone.`)) return;
    const previous = bookings;
    setBookings((prev) => prev.filter((b) => b.id !== id));
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setBookings(previous);
      setError("Couldn't delete booking. Please try again.");
    }
  };

  return (
    <div className="container py-5">
      <div className="cc-admin-header">
        <div>
          <span className="eyebrow mb-1">Admin Panel</span>
          <h2>Bookings</h2>
          <p>Every booking request — review, confirm and track status.</p>
        </div>
        <div className="cc-admin-header-meta">
          <span className="cc-status-pill ok">
            <span className="cc-status-dot" />
            {loading ? "Loading…" : `${bookings.length} booking${bookings.length === 1 ? "" : "s"}`}
          </span>
        </div>
      </div>

      <div className="cc-admin-filters">
        {/* Free-text search gets its own full-width row above the dropdowns —
            it's the control that gets used most, and squeezing it into a
            quarter-width grid cell made it the same visual weight as the
            "Package" filter. */}
        <div className="cc-admin-searchbar mb-3">
          <div className="cc-admin-search-field">
            <label className="cc-form-label" htmlFor="booking-search">
              Search Bookings
            </label>
            <input
              id="booking-search"
              type="text"
              className="form-control cc-form-control"
              placeholder="Ref, client name, email, phone, venue…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="cc-admin-search-actions">
            <button
              type="button"
              className="btn-cc-search"
              onClick={() => setQ((v) => v.trim())}
            >
              <Icon name="search" size={15} />
              Search
            </button>
            {hasFilters && (
              <button type="button" className="btn-cc-clear" onClick={clearFilters}>
                Reset Filters
              </button>
            )}
          </div>
        </div>

        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-6 col-lg-2">
            <label className="cc-form-label">Status</label>
            <select
              className="form-select cc-form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-6 col-lg-2">
            <label className="cc-form-label">Event Type</label>
            <select
              className="form-select cc-form-control"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              <option value="">All types</option>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-6 col-lg-2">
            <label className="cc-form-label">Package</label>
            <select
              className="form-select cc-form-control"
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
            >
              <option value="">All packages</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-6 col-lg-2">
            <label className="cc-form-label">Client</label>
            <input
              type="text"
              className="form-control cc-form-control"
              placeholder="Client name…"
              value={client}
              onChange={(e) => setClient(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-6 col-lg-2">
            <label className="cc-form-label">From</label>
            <input
              type="date"
              className="form-control cc-form-control"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-6 col-lg-2">
            <label className="cc-form-label">To</label>
            <input
              type="date"
              className="form-control cc-form-control"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="cc-admin-card">
        <div className="table-responsive">
          <table className="cc-admin-table mb-0">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Client</th>
                <th>Event Type</th>
                <th>Event Date</th>
                <th>Guests</th>
                <th>Package</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted-soft">
                    Loading bookings…
                  </td>
                </tr>
              )}

              {!loading && bookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted-soft">
                    {hasFilters
                      ? "No bookings match your search or filters."
                      : "No bookings yet."}
                  </td>
                </tr>
              )}

              {!loading &&
                bookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <Link href={`/admin/bookings/${b.id}`} className="cc-admin-ref">
                        {b.bookingRef}
                      </Link>
                    </td>
                    <td>
                      <div className="fw-semibold">{b.client?.fullName || "—"}</div>
                      <div className="small text-muted-soft">{b.client?.email}</div>
                    </td>
                    <td>{b.eventType}</td>
                    <td>{formatDate(b.eventDate)}</td>
                    <td>{b.guestCount}</td>
                    <td>{b.package?.name || <span className="text-muted-soft">—</span>}</td>
                    <td>
                      <select
                        className="form-select form-select-sm cc-form-control"
                        style={{ minWidth: 150 }}
                        value={b.status}
                        disabled={updatingId === b.id}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      >
                        {BOOKING_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="cc-admin-row-actions">
                        <button
                          type="button"
                          className="btn-cc-sm btn-cc-sm-success"
                          title="Approve booking"
                          disabled={updatingId === b.id || b.status === "Confirmed"}
                          onClick={() => handleApprove(b.id)}
                        >
                          <Icon name="check" size={14} />
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn-cc-sm btn-cc-sm-danger"
                          title="Reject booking"
                          disabled={updatingId === b.id || b.status === "Cancelled"}
                          onClick={() => handleReject(b.id)}
                        >
                          <Icon name="close" size={14} />
                          Reject
                        </button>
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="cc-admin-btn-icon"
                          title="View details"
                        >
                          <Icon name="eye" size={16} />
                        </Link>
                        <button
                          type="button"
                          className="cc-admin-btn-icon danger"
                          title="Delete booking"
                          onClick={() => handleDelete(b.id, b.bookingRef)}
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
