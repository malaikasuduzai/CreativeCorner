"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      const next = searchParams.get("next") || "/admin/dashboard";
      router.replace(next);
      router.refresh();
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
        <h2 className="mb-1">Admin Login</h2>
        <p className="text-muted-soft mb-4">
          Sign in to manage bookings, clients, services and events.
        </p>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
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
          <div className="mb-2">
            <label className="cc-form-label">Password</label>
            <input
              type="password"
              className="form-control cc-form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="text-end mb-4">
            <Link href="/admin/forgot-password" className="cc-auth-link">
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="btn btn-cc-gold w-100" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
