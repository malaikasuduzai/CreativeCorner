"use client";
import { useEffect, useState } from "react";

const EMPTY_FORM = {
  id: null,
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  features: "",
};

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busyId, setBusyId] = useState(null);

  const isEditing = form.id !== null;

  const loadPackages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/packages?all=true");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load packages");
      setPackages(data.packages || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const resetForm = () => setForm(EMPTY_FORM);

  const startEdit = (pkg) => {
    setForm({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      imageUrl: pkg.imageUrl || "",
      features: pkg.features || "",
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
        price: Number(form.price),
        imageUrl: form.imageUrl || null,
        features: form.features || null,
      };

      const res = isEditing
        ? await fetch(`/api/packages/${form.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/packages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save package");

      resetForm();
      await loadPackages();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (pkg) => {
    const confirmMsg = pkg.active
      ? `Deactivate "${pkg.name}"? It will be hidden from the public Packages page but kept on record.`
      : `Reactivate "${pkg.name}"? It will reappear on the public Packages page.`;
    if (!window.confirm(confirmMsg)) return;

    setBusyId(pkg.id);
    try {
      const res = await fetch(`/api/packages/${pkg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !pkg.active }),
      });
      if (!res.ok) throw new Error();
      await loadPackages();
    } catch {
      setError("Couldn't update package status. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container-fluid py-5 px-4">
      <div className="cc-admin-header">
        <div>
          <span className="eyebrow mb-1">Admin Panel</span>
          <h2>Packages</h2>
          <p>Build and price the bundles clients choose from at booking.</p>
        </div>
        <div className="cc-admin-header-meta">
          <span className="cc-status-pill ok">
            <span className="cc-status-dot" />
            {loading ? "Loading…" : `${packages.length} package${packages.length === 1 ? "" : "s"}`}
          </span>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="cc-admin-card p-4 mb-4">
        <h6 className="mb-3">{isEditing ? `Edit "${form.name}"` : "Add New Package"}</h6>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="cc-form-label">Package Name</label>
              <input
                type="text"
                className="form-control cc-form-control"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="cc-form-label">Price (Rs.)</label>
              <input
                type="number"
                min="0"
                className="form-control cc-form-control"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
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
              <label className="cc-form-label">Included Services (comma-separated)</label>
              <input
                type="text"
                className="form-control cc-form-control"
                value={form.features}
                onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                placeholder="Premium Decoration, Stage Setup, Event Coordination"
              />
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button type="submit" className="btn btn-cc-gold" disabled={saving}>
              {saving ? "Saving…" : isEditing ? "Save Changes" : "Add Package"}
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
              {!loading && packages.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="cc-empty-state">
                      <div className="cc-empty-state-icon">◆</div>
                      <div className="cc-empty-state-title">No packages yet</div>
                      <div>Add your first one using the form above.</div>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                packages.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="fw-semibold">{p.name}</div>
                      <div className="small text-muted-soft">
                        {p.description?.slice(0, 70)}
                        {p.description?.length > 70 ? "…" : ""}
                      </div>
                    </td>
                    <td>Rs. {p.price?.toLocaleString()}</td>
                    <td>
                      <span className={p.active ? "cc-badge-active" : "cc-badge-inactive"}>
                        {p.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex justify-content-end gap-2 flex-wrap">
                        <button
                          type="button"
                          className="btn-cc-sm"
                          onClick={() => startEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`btn-cc-sm ${p.active ? "btn-cc-sm-danger" : "btn-cc-sm-success"}`}
                          disabled={busyId === p.id}
                          onClick={() => toggleActive(p)}
                        >
                          {p.active ? "Deactivate" : "Activate"}
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
