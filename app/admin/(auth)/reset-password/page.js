"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!token || !email) {
      setError("This reset link is invalid. Please request a new one.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");

      setSuccess(true);
      setTimeout(() => router.replace("/admin/login"), 1800);
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
        <h2 className="mb-1">Reset Password</h2>
        <p className="text-muted-soft mb-4">Choose a new password for your admin account.</p>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        {success ? (
          <div className="alert alert-success py-2">
            Password updated. Redirecting to sign in…
          </div>
        ) : !token || !email ? (
          <div>
            <div className="alert alert-danger py-2">
              This reset link is missing or invalid.
            </div>
            <Link href="/admin/forgot-password" className="btn btn-cc-gold w-100">
              Request a New Link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="cc-form-label">New Password</label>
              <input
                type="password"
                className="form-control cc-form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                autoFocus
              />
            </div>
            <div className="mb-4">
              <label className="cc-form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control cc-form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <button type="submit" className="btn btn-cc-gold w-100" disabled={loading}>
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
