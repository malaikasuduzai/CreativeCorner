"use client";
import { useEffect, useState } from "react";

const EMPTY_FORM = { id: null, eventName: "", category: "", imageUrl: "", description: "" };

export default function AdminGalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busyId, setBusyId] = useState(null);

  const isEditing = form.id !== null;

  const loadItems = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/gallery?all=true");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load gallery items");
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const resetForm = () => setForm(EMPTY_FORM);

  const startEdit = (item) => {
    setForm({
      id: item.id,
      eventName: item.eventName,
      category: item.category,
      imageUrl: item.imageUrl,
      description: item.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        eventName: form.eventName,
        category: form.category,
        imageUrl: form.imageUrl,
        description: form.description || null,
      };

      const res = isEditing
        ? await fetch(`/api/gallery/${form.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/gallery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save gallery item");

      resetForm();
      await loadItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Show/Hide is the reversible toggle — it just flips `visible` and keeps
  // the row around.
  const toggleVisible = async (item) => {
    setBusyId(item.id);
    setError("");
    try {
      const res = await fetch(`/api/gallery/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !item.visible }),
      });
      if (!res.ok) throw new Error();
      await loadItems();
    } catch {
      setError("Couldn't update gallery item. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  // Delete is permanent — it removes the row entirely, so it asks for
  // confirmation first and clears the edit form if that item was open.
  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete "${item.eventName}"? This can't be undone.`
    );
    if (!confirmed) return;

    setBusyId(item.id);
    setError("");
    try {
      const res = await fetch(`/api/gallery/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      if (form.id === item.id) resetForm();
      await loadItems();
    } catch {
      setError("Couldn't delete gallery item. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container-fluid py-5 px-4">
      <div className="cc-admin-header">
        <div>
          <span className="eyebrow mb-1">Admin Panel</span>
          <h2>Gallery</h2>
          <p>Photos and videos shown in the public gallery.</p>
        </div>
        <div className="cc-admin-header-meta">
          <span className="cc-status-pill ok">
            <span className="cc-status-dot" />
            {loading ? "Loading…" : `${items.length} item${items.length === 1 ? "" : "s"}`}
          </span>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="cc-admin-card p-4 mb-4">
        <h6 className="mb-3">{isEditing ? `Edit "${form.eventName}"` : "Add New Gallery Item"}</h6>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="cc-form-label">Event Name</label>
              <input
                type="text"
                className="form-control cc-form-control"
                value={form.eventName}
                onChange={(e) => setForm((f) => ({ ...f, eventName: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="cc-form-label">Category</label>
              <input
                type="text"
                className="form-control cc-form-control"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Wedding, Corporate, Birthday…"
                required
              />
            </div>
            <div className="col-md-8">
              <label className="cc-form-label">Image URL</label>
              <input
                type="url"
                className="form-control cc-form-control"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://…"
                required
              />
            </div>
            <div className="col-12">
              <label className="cc-form-label">Description (optional)</label>
              <input
                type="text"
                className="form-control cc-form-control"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>

          {form.imageUrl && (
            <div className="mt-3">
              <div className="cc-form-label mb-1">Preview</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.imageUrl}
                alt="Preview"
                style={{ width: "140px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          )}

          <div className="d-flex gap-2 mt-3">
            <button type="submit" className="btn btn-cc-gold" disabled={saving}>
              {saving ? "Saving…" : isEditing ? "Save Changes" : "Add Gallery Item"}
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
                <th>Image</th>
                <th>Event</th>
                <th>Category</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                [0, 1, 2].map((i) => (
                  <tr key={`sk-${i}`}>
                    <td><span className="cc-skeleton d-inline-block" style={{ width: "56px", height: "40px" }}>&nbsp;</span></td>
                    <td><span className="cc-skeleton d-inline-block" style={{ width: "60%", height: "1.1rem" }}>&nbsp;</span></td>
                    <td><span className="cc-skeleton d-inline-block" style={{ width: "70px", height: "1.1rem" }}>&nbsp;</span></td>
                    <td><span className="cc-skeleton d-inline-block" style={{ width: "70px", height: "1.5rem", borderRadius: "999px" }}>&nbsp;</span></td>
                    <td className="text-end"><span className="cc-skeleton d-inline-block" style={{ width: "120px", height: "1.8rem" }}>&nbsp;</span></td>
                  </tr>
                ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="cc-empty-state">
                      <div className="cc-empty-state-icon">▩</div>
                      <div className="cc-empty-state-title">No gallery items yet</div>
                      <div>Add your first one using the form above.</div>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.eventName}
                        style={{ width: "56px", height: "40px", objectFit: "cover", borderRadius: "6px" }}
                        onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                      />
                    </td>
                    <td>
                      <div className="fw-semibold">{item.eventName}</div>
                      {item.description && (
                        <div className="small text-muted-soft">
                          {item.description.slice(0, 50)}
                          {item.description.length > 50 ? "…" : ""}
                        </div>
                      )}
                    </td>
                    <td>{item.category}</td>
                    <td>
                      <span className={item.visible ? "cc-badge-active" : "cc-badge-inactive"}>
                        {item.visible ? "Visible" : "Hidden"}
                      </span>
                    </td>
                    <td>
                      <div className="cc-admin-row-actions">
                        <button type="button" className="btn-cc-sm" onClick={() => startEdit(item)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`btn-cc-sm ${item.visible ? "btn-cc-sm-danger" : "btn-cc-sm-success"}`}
                          disabled={busyId === item.id}
                          onClick={() => toggleVisible(item)}
                        >
                          {item.visible ? "Hide" : "Show"}
                        </button>
                        <button
                          type="button"
                          className="btn-cc-sm btn-cc-sm-delete"
                          disabled={busyId === item.id}
                          onClick={() => handleDelete(item)}
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
