"use client";
import { useEffect, useState } from "react";

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

const EMPTY_FORM = {
  id: null,
  name: "",
  eventType: EVENT_TYPES[0],
  date: "",
  location: "",
  description: "",
  imageUrl: "",
  services: "",
  images: "",
  completed: false,
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toDateInputValue(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busyId, setBusyId] = useState(null);

  const isEditing = form.id !== null;

  const loadEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load events");
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const resetForm = () => setForm(EMPTY_FORM);

  const startEdit = (ev) => {
    setForm({
      id: ev.id,
      name: ev.name,
      eventType: ev.eventType,
      date: toDateInputValue(ev.date),
      location: ev.location,
      description: ev.description || "",
      imageUrl: ev.imageUrl || "",
      services: ev.services || "",
      images: ev.images || "",
      completed: ev.completed,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        eventType: form.eventType,
        date: form.date,
        location: form.location,
        description: form.description || null,
        imageUrl: form.imageUrl || null,
        services: form.services || null,
        images: form.images || null,
      };

      const res = isEditing
        ? await fetch(`/api/events/${form.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, completed: form.completed }),
          })
        : await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save event");

      resetForm();
      await loadEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleCompleted = async (ev) => {
    setBusyId(ev.id);
    setError("");
    try {
      const res = await fetch(`/api/events/${ev.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !ev.completed }),
      });
      if (!res.ok) throw new Error();
      await loadEvents();
    } catch {
      setError("Couldn't update event status. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (ev) => {
    if (!window.confirm(`Delete "${ev.name}"? This can't be undone and removes it from the public Portfolio page.`)) return;
    setBusyId(ev.id);
    setError("");
    try {
      const res = await fetch(`/api/events/${ev.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete event");
      await loadEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container-fluid py-5 px-4">
      <div className="cc-admin-header">
        <div>
          <span className="eyebrow mb-1">Admin Panel</span>
          <h2>Events</h2>
          <p>Past and upcoming events featured on your public site.</p>
        </div>
        <div className="cc-admin-header-meta">
          <span className="cc-status-pill ok">
            <span className="cc-status-dot" />
            {loading ? "Loading…" : `${events.length} event${events.length === 1 ? "" : "s"}`}
          </span>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="cc-admin-card p-4 mb-4">
        <h6 className="mb-3">{isEditing ? `Edit "${form.name}"` : "Add New Event"}</h6>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="cc-form-label">Event Name</label>
              <input
                type="text"
                className="form-control cc-form-control"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="cc-form-label">Event Type</label>
              <select
                className="form-select cc-form-control"
                value={form.eventType}
                onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="cc-form-label">Date</label>
              <input
                type="date"
                className="form-control cc-form-control"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="cc-form-label">Location</label>
              <input
                type="text"
                className="form-control cc-form-control"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="cc-form-label">Cover Image URL</label>
              <input
                type="url"
                className="form-control cc-form-control"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://…"
              />
            </div>
            <div className="col-12">
              <label className="cc-form-label">Description</label>
              <textarea
                className="form-control cc-form-control"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <label className="cc-form-label">Services Provided (comma-separated)</label>
              <input
                type="text"
                className="form-control cc-form-control"
                value={form.services}
                onChange={(e) => setForm((f) => ({ ...f, services: e.target.value }))}
                placeholder="Decoration, Catering, Photography"
              />
            </div>
            <div className="col-md-6">
              <label className="cc-form-label">Additional Image URLs (comma-separated)</label>
              <input
                type="text"
                className="form-control cc-form-control"
                value={form.images}
                onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
                placeholder="https://…, https://…"
              />
            </div>
            {isEditing && (
              <div className="col-12">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="cc-event-completed"
                    checked={form.completed}
                    onChange={(e) => setForm((f) => ({ ...f, completed: e.target.checked }))}
                  />
                  <label className="form-check-label cc-form-label mb-0" htmlFor="cc-event-completed">
                    Mark as completed
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="d-flex gap-2 mt-3">
            <button type="submit" className="btn btn-cc-gold" disabled={saving}>
              {saving ? "Saving…" : isEditing ? "Save Changes" : "Add Event"}
            </button>
            {isEditing && (
              <button
                type="button"
                className="btn btn-cc-muted"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="cc-admin-card">
        <div className="table-responsive">
          <table className="cc-admin-table mb-0">
            <thead>
              <tr>
                <th>Event</th>
                <th>Type</th>
                <th>Date</th>
                <th>Location</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                [0, 1, 2].map((i) => (
                  <tr key={`sk-${i}`}>
                    <td><span className="cc-skeleton d-inline-block" style={{ width: "70%", height: "1.1rem" }}>&nbsp;</span></td>
                    <td><span className="cc-skeleton d-inline-block" style={{ width: "60px", height: "1.1rem" }}>&nbsp;</span></td>
                    <td><span className="cc-skeleton d-inline-block" style={{ width: "70px", height: "1.1rem" }}>&nbsp;</span></td>
                    <td><span className="cc-skeleton d-inline-block" style={{ width: "80px", height: "1.1rem" }}>&nbsp;</span></td>
                    <td><span className="cc-skeleton d-inline-block" style={{ width: "70px", height: "1.5rem", borderRadius: "999px" }}>&nbsp;</span></td>
                    <td className="text-end"><span className="cc-skeleton d-inline-block" style={{ width: "140px", height: "1.8rem" }}>&nbsp;</span></td>
                  </tr>
                ))}
              {!loading && events.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="cc-empty-state">
                      <div className="cc-empty-state-icon">★</div>
                      <div className="cc-empty-state-title">No events yet</div>
                      <div>Add your first one using the form above.</div>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                events.map((ev) => (
                  <tr key={ev.id}>
                    <td>
                      <div className="fw-semibold">{ev.name}</div>
                      {ev.description && (
                        <div className="small text-muted-soft">
                          {ev.description.slice(0, 60)}
                          {ev.description.length > 60 ? "…" : ""}
                        </div>
                      )}
                    </td>
                    <td>{ev.eventType}</td>
                    <td className="small">{formatDate(ev.date)}</td>
                    <td className="small">{ev.location}</td>
                    <td>
                      <span className={ev.completed ? "cc-badge-active" : "cc-badge-inactive"}>
                        {ev.completed ? "Completed" : "Upcoming"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex justify-content-end gap-2 flex-wrap">
                        <button type="button" className="btn-cc-sm" onClick={() => startEdit(ev)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`btn-cc-sm ${ev.completed ? "btn-cc-sm-neutral" : "btn-cc-sm-success"}`}
                          disabled={busyId === ev.id}
                          onClick={() => toggleCompleted(ev)}
                        >
                          {ev.completed ? "Mark Upcoming" : "Mark Completed"}
                        </button>
                        <button
                          type="button"
                          className="btn-cc-sm btn-cc-sm-danger"
                          disabled={busyId === ev.id}
                          onClick={() => handleDelete(ev)}
                        >
                          Delete
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
