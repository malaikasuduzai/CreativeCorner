"use client";
import { Fragment, useEffect, useState } from "react";

const STATUSES = ["New", "In Progress", "Resolved"];

const STATUS_BADGE = {
  New: "cc-status-pending",
  "In Progress": "cc-status-in-progress",
  Resolved: "cc-status-confirmed",
};

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

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadInquiries = async (status) => {
    setLoading(true);
    setError("");
    try {
      const url = status ? `/api/inquiries?status=${encodeURIComponent(status)}` : "/api/inquiries";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load inquiries");
      setInquiries(data.inquiries || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleStatusChange = async (inquiry, status) => {
    setBusyId(inquiry.id);
    setError("");
    try {
      const res = await fetch(`/api/inquiries/${inquiry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      await loadInquiries(statusFilter);
    } catch {
      setError("Couldn't update inquiry status. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (inquiry) => {
    if (!window.confirm(`Delete the inquiry from "${inquiry.name}"? This can't be undone.`)) return;
    setBusyId(inquiry.id);
    setError("");
    try {
      const res = await fetch(`/api/inquiries/${inquiry.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete inquiry");
      await loadInquiries(statusFilter);
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
          <h2>Inquiries</h2>
          <p>Messages from the contact form, ready to follow up on.</p>
        </div>
        <div className="cc-admin-header-meta">
          <span className="cc-status-pill ok">
            <span className="cc-status-dot" />
            {loading ? "Loading…" : `${inquiries.length} inquir${inquiries.length === 1 ? "y" : "ies"}`}
          </span>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="cc-admin-filters d-flex flex-wrap gap-2 align-items-center">
        <span className="cc-form-label mb-0">Filter by status:</span>
        <button
          type="button"
          className={`cc-filter-pill ${statusFilter === "" ? "active" : ""}`}
          onClick={() => setStatusFilter("")}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={`cc-filter-pill ${statusFilter === s ? "active" : ""}`}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="cc-admin-card">
        <div className="table-responsive">
          <table className="cc-admin-table mb-0">
            <thead>
              <tr>
                <th>From</th>
                <th>Subject</th>
                <th>Received</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                [0, 1, 2].map((i) => (
                  <tr key={`sk-${i}`}>
                    <td><span className="cc-skeleton d-inline-block" style={{ width: "60%", height: "1.1rem" }}>&nbsp;</span></td>
                    <td><span className="cc-skeleton d-inline-block" style={{ width: "80%", height: "1.1rem" }}>&nbsp;</span></td>
                    <td><span className="cc-skeleton d-inline-block" style={{ width: "100px", height: "1.1rem" }}>&nbsp;</span></td>
                    <td><span className="cc-skeleton d-inline-block" style={{ width: "80px", height: "1.5rem", borderRadius: "999px" }}>&nbsp;</span></td>
                    <td className="text-end"><span className="cc-skeleton d-inline-block" style={{ width: "140px", height: "1.8rem" }}>&nbsp;</span></td>
                  </tr>
                ))}
              {!loading && inquiries.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="cc-empty-state">
                      <div className="cc-empty-state-icon">✉</div>
                      <div className="cc-empty-state-title">No inquiries {statusFilter ? `with status "${statusFilter}"` : "yet"}</div>
                      <div>New messages from the public Contact page will show up here.</div>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                inquiries.map((inq) => {
                  const isOpen = expandedId === inq.id;
                  return (
                    <Fragment key={inq.id}>
                      <tr
                        onClick={() => setExpandedId(isOpen ? null : inq.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <div className="fw-semibold">{inq.name}</div>
                          <div className="small text-muted-soft">{inq.email}</div>
                        </td>
                        <td>
                          <div>{inq.subject}</div>
                          <div className="small text-muted-soft">
                            {inq.message.slice(0, 50)}
                            {inq.message.length > 50 ? "…" : ""}
                          </div>
                        </td>
                        <td className="small text-muted-soft">{formatDateTime(inq.createdAt)}</td>
                        <td>
                          <span className={`cc-status-badge ${STATUS_BADGE[inq.status] || "cc-status-pending"}`}>
                            {inq.status}
                          </span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="d-flex justify-content-end gap-2 flex-wrap">
                            <select
                              className="form-select cc-form-control"
                              style={{ width: "150px" }}
                              value={inq.status}
                              disabled={busyId === inq.id}
                              onChange={(e) => handleStatusChange(inq, e.target.value)}
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="btn-cc-sm btn-cc-sm-danger"
                              disabled={busyId === inq.id}
                              onClick={() => handleDelete(inq)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={5} style={{ padding: 0 }}>
                            <div className="cc-admin-inquiry-detail m-3">
                              <div className="cc-detail-label">Full Message</div>
                              <div className="cc-detail-value" style={{ whiteSpace: "pre-wrap" }}>{inq.message}</div>
                              <div className="row g-3">
                                <div className="col-md-4"><div className="cc-detail-label">Email</div><div className="cc-detail-value mb-0">{inq.email}</div></div>
                                {inq.phone && (
                                  <div className="col-md-4"><div className="cc-detail-label">Phone</div><div className="cc-detail-value mb-0">{inq.phone}</div></div>
                                )}
                                <div className="col-md-4"><div className="cc-detail-label">Received</div><div className="cc-detail-value mb-0">{formatDateTime(inq.createdAt)}</div></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
