"use client";
import { useEffect, useState } from "react";

const EMPTY_FORM = {
  id: null,
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  features: "",
  active: true,
};

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busyId, setBusyId] = useState(null);

  const isEditing = form.id !== null;

  const loadServices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/services?all=true");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load services");
      setServices(data.services || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const resetForm = () => setForm(EMPTY_FORM);

  const startEdit = (service) => {
    setForm({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price ?? "",
      imageUrl: service.imageUrl || "",
      features: service.features || "",
      active: service.active,
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
        description: form.description,
        price: form.price === "" ? null : Number(form.price),
        imageUrl: form.imageUrl || null,
        features: form.features || null,
      };

      const res = isEditing
        ? await fetch(`/api/services/${form.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/services", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save service");

      resetForm();
      await loadServices();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (service) => {
    const confirmMsg = service.active
      ? `Deactivate "${service.name}"? It will be hidden from the public Services page but kept on record.`
      : `Reactivate "${service.name}"? It will reappear on the public Services page.`;
    if (!window.confirm(confirmMsg)) return;

    setBusyId(service.id);
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !service.active }),
      });
      if (!res.ok) throw new Error();
      await loadServices();
    } catch {
      setError("Couldn't update service status. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container-fluid py-5 px-4">
      <div className="cc-admin-header">
        <div>
          <span className="eyebrow mb-1">Admin Panel</span>
          <h2>Services</h2>
          <p>What you offer on the public site, kept accurate and current.</p>
        </div>
        <div className="cc-admin-header-meta">
          <span className="cc-status-pill ok">
            <span className="cc-status-dot" />
            {loading ? "Loading…" : `${services.length} service${services.length === 1 ? "" : "s"}`}
          </span>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="cc-admin-card p-4 mb-4">
        <h6 className="mb-3">{isEditing ? `Edit "${form.name}"` : "Add New Service"}</h6>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="cc-form-label">Service Name</label>
              <input
                type="text"
                className="form-control cc-form-control"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="cc-form-label">Starting Price (Rs.)</label>
              <input
                type="number"
                min="0"
                className="form-control cc-form-control"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
            <div className="col-md-3">
              <label className="cc-form-label">Image URL</label>
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
                required
              />
            </div>
            <div className="col-12">
              <label className="cc-form-label">Key Features (comma-separated)</label>
              <input
                type="text"
                className="form-control cc-form-control"
                value={form.features}
                onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                placeholder="Venue selection, Vendor coordination, Day-of management"
              />
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button type="submit" className="btn btn-cc-gold" disabled={saving}>
              {saving ? "Saving…" : isEditing ? "Save Changes" : "Add Service"}
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
                <th>Name</th>
                <th>Price</th>
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
                    <td><span className="cc-skeleton d-inline-block" style={{ width: "70px", height: "1.5rem", borderRadius: "999px" }}>&nbsp;</span></td>
                    <td className="text-end"><span className="cc-skeleton d-inline-block" style={{ width: "120px", height: "1.8rem" }}>&nbsp;</span></td>
                  </tr>
                ))}
              {!loading && services.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="cc-empty-state">
                      <div className="cc-empty-state-icon">◆</div>
                      <div className="cc-empty-state-title">No services yet</div>
                      <div>Add your first one using the form above.</div>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                services.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="fw-semibold">{s.name}</div>
                      <div className="small text-muted-soft">
                        {s.description?.slice(0, 70)}
                        {s.description?.length > 70 ? "…" : ""}
                      </div>
                    </td>
                    <td>{s.price ? `Rs. ${s.price.toLocaleString()}` : "—"}</td>
                    <td>
                      <span className={s.active ? "cc-badge-active" : "cc-badge-inactive"}>
                        {s.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex justify-content-end gap-2 flex-wrap">
                        <button
                          type="button"
                          className="btn-cc-sm"
                          onClick={() => startEdit(s)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`btn-cc-sm ${s.active ? "btn-cc-sm-danger" : "btn-cc-sm-success"}`}
                          disabled={busyId === s.id}
                          onClick={() => toggleActive(s)}
                        >
                          {s.active ? "Deactivate" : "Activate"}
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
