"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", whatsapp: "" });

  const loadClient = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/clients/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load client");
      setClient(data.client);
      setForm({
        fullName: data.client.fullName,
        phone: data.client.phone,
        whatsapp: data.client.whatsapp || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          whatsapp: form.whatsapp || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update client");
      setClient(data.client);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (client.bookings?.length > 0) {
      window.alert(
        `${client.fullName} has ${client.bookings.length} booking(s) on record and can't be deleted. Cancel or reassign their bookings first.`
      );
      return;
    }
    if (!window.confirm(`Delete client "${client.fullName}"? This can't be undone.`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete client");
      router.push("/admin/clients");
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5 px-4">
        <div className="cc-admin-card p-5 text-center text-muted-soft">Loading client…</div>
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="container-fluid py-5 px-4">
        <div className="alert alert-danger">{error}</div>
        <Link href="/admin/clients" className="btn-cc-sm btn-cc-sm-neutral">
          ← Back to Clients
        </Link>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="container-fluid py-5 px-4">
      <div className="cc-admin-header d-flex flex-wrap justify-content-between align-items-end gap-3">
        <div>
          <Link href="/admin/clients" className="small text-muted-soft text-decoration-none">
            ← Back to Clients
          </Link>
          <h2 className="mb-0 mt-1">{client.fullName}</h2>
        </div>
        <button
          type="button"
          className="btn-cc-sm btn-cc-sm-danger"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting…" : "Delete Client"}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="cc-admin-card p-4">
            <h6 className="mb-3">Client Information</h6>
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="cc-form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control cc-form-control"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="cc-form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control cc-form-control"
                  value={client.email}
                  disabled
                  title="Email can't be changed — it identifies this client's booking history."
                />
              </div>
              <div className="mb-3">
                <label className="cc-form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control cc-form-control"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="cc-form-label">WhatsApp Number</label>
                <input
                  type="text"
                  className="form-control cc-form-control"
                  value={form.whatsapp}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                />
              </div>
              <button type="submit" className="btn btn-cc-gold" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </div>

          <div className="cc-admin-card p-4 mt-4">
            <h6 className="mb-3">Summary</h6>
            <div className="d-flex justify-content-between small mb-2">
              <span className="text-muted-soft">Client Since</span>
              <span>{formatDate(client.createdAt)}</span>
            </div>
            <div className="d-flex justify-content-between small">
              <span className="text-muted-soft">Total Bookings</span>
              <span>{client.bookings?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="cc-admin-card p-4">
            <h6 className="mb-3">Booking / Event History</h6>
            <div className="table-responsive">
              <table className="cc-admin-table mb-0">
                <thead>
                  <tr>
                    <th>Booking Ref</th>
                    <th>Event Type</th>
                    <th>Event Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(!client.bookings || client.bookings.length === 0) && (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-muted-soft">
                        No bookings yet for this client.
                      </td>
                    </tr>
                  )}
                  {client.bookings
                    ?.slice()
                    .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
                    .map((b) => (
                      <tr key={b.id}>
                        <td>
                          <Link href={`/admin/bookings/${b.id}`} className="cc-admin-ref">
                            {b.bookingRef}
                          </Link>
                        </td>
                        <td>{b.eventName || b.eventType}</td>
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
    </div>
  );
}
