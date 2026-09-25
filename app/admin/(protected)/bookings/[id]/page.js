"use client";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/admin/StatusBadge";
import { BOOKING_STATUSES } from "@/lib/bookingStatus";
import Icon from "@/components/admin/Icon";

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

const REQUIREMENT_FIELDS = [
  { key: "decorationRequirements", label: "Decoration Requirements" },
  { key: "cateringRequirements", label: "Catering Requirements" },
  { key: "photographyRequirements", label: "Photography Requirements" },
  { key: "stageRequirements", label: "Stage Requirements" },
  { key: "lightingRequirements", label: "Lighting Requirements" },
  { key: "specialInstructions", label: "Special Instructions" },
];

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateInputValue(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function Field({ label, value }) {
  return (
    <div>
      <div className="cc-detail-label">{label}</div>
      <div className="cc-detail-value cc-detail-value-box">{value || <span className="text-muted-soft">—</span>}</div>
    </div>
  );
}

function EditBookingForm({ booking, packages, onCancel, onSaved }) {
  const [form, setForm] = useState({
    eventType: booking.eventType || "",
    eventName: booking.eventName || "",
    eventDate: toDateInputValue(booking.eventDate),
    guestCount: booking.guestCount || "",
    packageId: booking.packageId != null ? String(booking.packageId) : "",
    venue: booking.venue || "",
    address: booking.address || "",
    city: booking.city || "",
    decorationRequirements: booking.decorationRequirements || "",
    cateringRequirements: booking.cateringRequirements || "",
    photographyRequirements: booking.photographyRequirements || "",
    stageRequirements: booking.stageRequirements || "",
    lightingRequirements: booking.lightingRequirements || "",
    specialInstructions: booking.specialInstructions || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: form.eventType,
          eventName: form.eventName || null,
          eventDate: form.eventDate,
          guestCount: Number(form.guestCount),
          packageId: form.packageId === "" ? null : Number(form.packageId),
          venue: form.venue,
          address: form.address,
          city: form.city,
          decorationRequirements: form.decorationRequirements || null,
          cateringRequirements: form.cateringRequirements || null,
          photographyRequirements: form.photographyRequirements || null,
          stageRequirements: form.stageRequirements || null,
          lightingRequirements: form.lightingRequirements || null,
          specialInstructions: form.specialInstructions || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update booking");
      onSaved(data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cc-admin-card cc-booking-detail-card p-4 mb-4">
      <h5 className="mb-3">Edit Booking</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3">
        <div className="col-md-6">
          <label className="cc-form-label">Event Type</label>
          <select
            className="form-select cc-form-control"
            value={form.eventType}
            onChange={(e) => update("eventType", e.target.value)}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="cc-form-label">Event Name</label>
          <input
            type="text"
            className="form-control cc-form-control"
            value={form.eventName}
            onChange={(e) => update("eventName", e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label className="cc-form-label">Event Date</label>
          <input
            type="date"
            className="form-control cc-form-control"
            value={form.eventDate}
            onChange={(e) => update("eventDate", e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label className="cc-form-label">Guest Count</label>
          <input
            type="number"
            min="1"
            className="form-control cc-form-control"
            value={form.guestCount}
            onChange={(e) => update("guestCount", e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label className="cc-form-label">Package</label>
          <select
            className="form-select cc-form-control"
            value={form.packageId}
            onChange={(e) => update("packageId", e.target.value)}
          >
            <option value="">No package</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="cc-form-label">City</label>
          <input
            type="text"
            className="form-control cc-form-control"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label className="cc-form-label">Venue</label>
          <input
            type="text"
            className="form-control cc-form-control"
            value={form.venue}
            onChange={(e) => update("venue", e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label className="cc-form-label">Address</label>
          <input
            type="text"
            className="form-control cc-form-control"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </div>

        {REQUIREMENT_FIELDS.map((f) => (
          <div className="col-md-6" key={f.key}>
            <label className="cc-form-label">{f.label}</label>
            <textarea
              className="form-control cc-form-control"
              rows={2}
              value={form[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="d-flex gap-2 mt-4">
        <button
          type="button"
          className="btn btn-cc-gold"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
        <button
          type="button"
          className="btn btn-cc-outline"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminBookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [booking, setBooking] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking not found");
      setBooking(data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/packages");
        const data = await res.json();
        if (res.ok) setPackages(data.packages || []);
      } catch {
        // Non-fatal — the edit form's package dropdown just won't have options.
      }
    })();
  }, []);

  const handleStatusChange = async (newStatus) => {
    setSavingStatus(true);
    setStatusMessage("");
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");
      setBooking(data.booking);
      setStatusMessage(`Status updated to "${newStatus}".`);
    } catch (err) {
      setStatusMessage(err.message);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(booking.bookingRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked (e.g. insecure origin); the reference stays selectable.
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete booking ${booking.bookingRef}? This can't be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete booking");
      router.push("/admin/bookings");
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <p className="text-muted-soft">Loading booking…</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
        <Link href="/admin/bookings" className="btn btn-cc-outline">
          &larr; Back to Bookings
        </Link>
      </div>
    );
  }

  const filledRequirements = REQUIREMENT_FIELDS.filter((f) => booking[f.key]);

  return (
    <div className="container py-5">
      <Link href="/admin/bookings" className="cc-booking-back">
        <span aria-hidden="true">&larr;</span> Back to Bookings
      </Link>

      <header className="cc-booking-hero">
        <div className="cc-booking-hero-main">
          <span className="cc-booking-hero-icon"><Icon name="file" size={26} /></span>
          <div className="cc-booking-hero-text">
            <span className="cc-booking-hero-tag">Booking management</span>
            <h2>Booking Details</h2>
            <p>View and manage booking information</p>
          </div>
        </div>

        <div className="cc-booking-reference-box">
          <span className="cc-booking-reference-label">Booking reference</span>
          <div className="cc-booking-reference-row">
            <strong>{booking.bookingRef}</strong>
            <button
              type="button"
              className={`cc-booking-copy${copied ? " is-copied" : ""}`}
              onClick={handleCopyRef}
              aria-label={copied ? "Booking reference copied" : "Copy booking reference"}
              title={copied ? "Copied" : "Copy reference"}
            >
              <Icon name={copied ? "checkCircle" : "copy"} size={15} />
            </button>
            <StatusBadge status={booking.status} />
          </div>
        </div>
      </header>

      <div className="cc-booking-actions-bar">
        <div className="cc-booking-actions-label">Booking Actions</div>
        <div className="d-flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn-cc-sm btn-cc-sm-success"
            disabled={savingStatus || booking.status === "Confirmed"}
            onClick={() => handleStatusChange("Confirmed")}
          >
            Approve
          </button>
          <button
            type="button"
            className="btn-cc-sm btn-cc-sm-danger"
            disabled={savingStatus || booking.status === "Cancelled"}
            onClick={() => handleStatusChange("Cancelled")}
          >
            Reject
          </button>
          <button
            type="button"
            className="btn-cc-sm"
            onClick={() => setEditing((e) => !e)}
          >
            {editing ? "Close Edit" : "Edit Booking"}
          </button>
          <button
            type="button"
            className="btn-cc-sm btn-cc-sm-danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete Booking"}
          </button>
        </div>
      </div>

      {editing && (
        <EditBookingForm
          booking={booking}
          packages={packages}
          onCancel={() => setEditing(false)}
          onSaved={(updated) => {
            setBooking(updated);
            setEditing(false);
            setStatusMessage("Booking updated.");
          }}
        />
      )}

      <div className="row g-4 cc-booking-detail-grid">
        <div className="col-lg-8">
          <div className="cc-admin-card cc-booking-detail-card p-4 mb-4">
            <div className="cc-detail-section-title"><span className="cc-detail-icon"><Icon name="userPlus" size={19} /></span><div><h5>Client Details</h5><span>Customer contact information</span></div></div>
            <div className="row g-3">
              <div className="col-md-6"><Field label="Full Name" value={booking.client?.fullName} /></div>
              <div className="col-md-6"><Field label="Phone" value={booking.client?.phone} /></div>
              <div className="col-md-6"><Field label="Email" value={booking.client?.email} /></div>
              <div className="col-md-6"><Field label="WhatsApp" value={booking.client?.whatsapp} /></div>
            </div>
          </div>

          <div className="cc-admin-card cc-booking-detail-card p-4 mb-4">
            <div className="cc-detail-section-title"><span className="cc-detail-icon"><Icon name="calendar" size={19} /></span><div><h5>Event Details</h5><span>Event schedule and package information</span></div></div>
            <div className="row g-3">
              <div className="col-md-6"><Field label="Event Type" value={booking.eventType} /></div>
              <div className="col-md-6"><Field label="Event Name" value={booking.eventName} /></div>
              <div className="col-md-6"><Field label="Event Date" value={formatDate(booking.eventDate)} /></div>
              <div className="col-md-6"><Field label="Guest Count" value={booking.guestCount} /></div>
              <div className="col-md-6"><Field label="Package" value={booking.package?.name} /></div>
              {booking.package?.price != null && (
                <div className="col-md-6"><Field label="Package Price" value={`PKR ${booking.package.price.toLocaleString()}`} /></div>
              )}
            </div>
          </div>

          <div className="cc-admin-card cc-booking-detail-card p-4 mb-4">
            <div className="cc-detail-section-title"><span className="cc-detail-icon"><Icon name="pin" size={19} /></span><div><h5>Location</h5><span>Event venue and address</span></div></div>
            <div className="row g-3">
              <div className="col-md-6"><Field label="Venue" value={booking.venue} /></div>
              <div className="col-md-6"><Field label="City" value={booking.city} /></div>
              <div className="col-12"><Field label="Address" value={booking.address} /></div>
            </div>
          </div>

          <div className="cc-admin-card cc-booking-detail-card p-4">
            <div className="cc-detail-section-title"><span className="cc-detail-icon"><Icon name="file" size={19} /></span><div><h5>Additional Requirements</h5><span>Special requests provided by the client</span></div></div>
            {filledRequirements.length === 0 ? (
              <p className="text-muted-soft mb-0">No additional requirements were provided.</p>
            ) : (
              <div className="row g-3">
                {filledRequirements.map((f) => (
                  <div className="col-md-6" key={f.key}>
                    <Field label={f.label} value={booking[f.key]} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="cc-admin-card cc-booking-detail-card p-4 mb-4">
            <div className="cc-detail-section-title"><span className="cc-detail-icon"><Icon name="refresh" size={19} /></span><div><h5>Update Status</h5><span>Change the current booking status</span></div></div>
            <select
              className="form-select cc-form-control mb-2"
              value={booking.status}
              disabled={savingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {statusMessage && (
              <div className="small" style={{ color: "var(--cc-text-muted)" }}>{statusMessage}</div>
            )}
          </div>

          <div className="cc-admin-card cc-booking-detail-card p-4">
            <div className="cc-detail-section-title"><span className="cc-detail-icon"><Icon name="file" size={19} /></span><div><h5>Booking Info</h5><span>Reference and creation details</span></div></div>
            <Field label="Booking ID" value={`#${booking.id}`} />
            <Field label="Booking Reference ID" value={booking.bookingRef} />
            <Field label="Created" value={formatDateTime(booking.createdAt)} />
          </div>
        </div>
      </div>
    </div>
  );
}
