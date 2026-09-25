"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cc-auth-shell">
      <div className="cc-auth-card">
        <img src="/logo-mark.png" alt="" className="cc-auth-mark" />
        <span className="eyebrow">Creative Corner</span>
        <h2 className="mb-1">Forgot Password</h2>
        <p className="text-muted-soft mb-4">
          Enter your admin email and we&apos;ll generate a password reset link.
        </p>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        {submitted ? (
          <div>
            <div className="alert alert-success py-2">
              If an account exists for that email, a reset link has been generated.
            </div>
            <Link href="/admin/login" className="btn btn-cc-outline w-100 mt-3">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label className="cc-form-label">Email Address</label>
              <input
                type="email"
                className="form-control cc-form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-cc-gold w-100" disabled={loading}>
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
            <div className="text-center mt-3">
              <Link href="/admin/login" className="cc-auth-link">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
