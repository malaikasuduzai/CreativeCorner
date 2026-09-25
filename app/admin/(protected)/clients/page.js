"use client";
import { useEffect, useState } from "react";

const EMPTY_FORM = { id: null, fullName: "", email: "", phone: "", whatsapp: "" };

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState("");

  const isEditing = form.id !== null;

  const loadClients = async (q) => {
    setLoading(true);
    setError("");
    try {
      const url = q ? `/api/clients?q=${encodeURIComponent(q)}` : "/api/clients";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load clients");
      setClients(data.clients || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadClients(search.trim());
  };

  const resetForm = () => setForm(EMPTY_FORM);

  const startEdit = (client) => {
    setForm({
      id: client.id,
      fullName: client.fullName,
      email: client.email,
      phone: client.phone,
      whatsapp: client.whatsapp || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isEditing) {
        const res = await fetch(`/api/clients/${form.id}`, {
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
      } else {
        const res = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
            whatsapp: form.whatsapp || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to add client");
      }

      resetForm();
      await loadClients(search.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (client) => {
    if (!window.confirm(`Delete "${client.fullName}"? This can't be undone.`)) return;
    setBusyId(client.id);
    setError("");
    try {
      const res = await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete client");
      await loadClients(search.trim());
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
          <h2>Clients</h2>
          <p>Everyone who has booked or inquired, in one place.</p>
        </div>
        <div className="cc-admin-header-meta">
          <span className="cc-status-pill ok">
            <span className="cc-status-dot" />
            {loading ? "Loading…" : `${clients.length} client${clients.length === 1 ? "" : "s"}`}
          </span>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="cc-admin-card p-4 mb-4">
        <h6 className="mb-3">{isEditing ? `Edit "${form.fullName}"` : "Add New Client"}</h6>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="cc-form-label">Full Name</label>
              <input
                type="text"
                className="form-control cc-form-control"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="cc-form-label">
                Email Address {isEditing && <span className="text-muted-soft">(can't be changed)</span>}
              </label>
              <input
                type="email"
                className="form-control cc-form-control"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                disabled={isEditing}
                required={!isEditing}
              />
            </div>
            <div className="col-md-6">
              <label className="cc-form-label">Phone</label>
              <input
                type="text"
                className="form-control cc-form-control"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="cc-form-label">WhatsApp (optional)</label>
              <input
                type="text"
                className="form-control cc-form-control"
                value={form.whatsapp}
                onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
              />
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button type="submit" className="btn btn-cc-gold" disabled={saving}>
              {saving ? "Saving…" : isEditing ? "Save Changes" : "Add Client"}
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

      <div className="cc-admin-filters">
        <form onSubmit={handleSearchSubmit} className="cc-admin-searchbar">
          <div className="cc-admin-search-field">
            <label className="cc-form-label" htmlFor="client-search">
              Search Clients
            </label>
            <input
              id="client-search"
              type="text"
              className="form-control cc-form-control"
              placeholder="Search by name, email or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="cc-admin-search-actions">
            <button type="submit" className="btn-cc-search">
              <span aria-hidden="true">&#128269;</span> Search
            </button>
            {search && (
              <button
                type="button"
                className="btn-cc-clear"
                onClick={() => {
                  setSearch("");
                  loadClients("");
                }}
              >
                Clear
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
                <th>Name</th>
                <th>Contact</th>
                <th>Bookings</th>
                <th>Joined</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                [0, 1, 2].map((i) => (
                  <tr key={`sk-${i}`}>
                    <td><span className="cc-skeleton d-inline-block" style={{ width: "60%", height: "1.1rem" }}>&nbsp;</span></td>
                    <td><span className="cc-skeleton d-inline-block" style={{ width: "80%", height: "1.1rem" }}>&nbsp;</span></td>
                    <td><span className="cc-skeleton d-inline-block" style={{ width: "30px", height: "1.1rem" }}>&nbsp;</span></td>
                    <td><span className="cc-skeleton d-inline-block" style={{ width: "70px", height: "1.1rem" }}>&nbsp;</span></td>
                    <td className="text-end"><span className="cc-skeleton d-inline-block" style={{ width: "80px", height: "1.8rem" }}>&nbsp;</span></td>
                  </tr>
                ))}
              {!loading && clients.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="cc-empty-state">
                      <div className="cc-empty-state-icon">◈</div>
                      <div className="cc-empty-state-title">No clients found</div>
                      <div>{search ? "Try a different search term." : "Add your first client using the form above."}</div>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                clients.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-semibold">{c.fullName}</td>
                    <td>
                      <div className="small">{c.email}</div>
                      <div className="small text-muted-soft">
                        {c.phone}
                        {c.whatsapp ? ` · WhatsApp: ${c.whatsapp}` : ""}
                      </div>
                    </td>
                    <td>{c.bookings?.length ?? 0}</td>
                    <td className="small text-muted-soft">{formatDate(c.createdAt)}</td>
                    <td>
                      <div className="d-flex justify-content-end gap-2 flex-wrap">
                        <button type="button" className="btn-cc-sm" onClick={() => startEdit(c)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-cc-sm btn-cc-sm-danger"
                          disabled={busyId === c.id}
                          onClick={() => handleDelete(c)}
                          title={c.bookings?.length ? "Clients with bookings can't be deleted" : "Delete client"}
                        >
                          {busyId === c.id ? "…" : "Delete"}
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
