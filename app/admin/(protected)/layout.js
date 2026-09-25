"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import NotificationBell from "@/components/admin/NotificationBell";
import Icon from "@/components/Icon";

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "layoutDashboard" },
  { href: "/admin/bookings", label: "Bookings", icon: "clipboardList" },
  { href: "/admin/clients", label: "Clients", icon: "users" },
  { href: "/admin/services", label: "Services", icon: "settings2" },
  { href: "/admin/packages", label: "Packages", icon: "package" },
  { href: "/admin/events", label: "Events", icon: "calendarDays" },
  { href: "/admin/gallery", label: "Gallery", icon: "image" },
  { href: "/admin/inquiries", label: "Inquiries", icon: "mail" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export default function AdminProtectedLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/me");
        const data = await res.json();
        if (data.admin) setAdminEmail(data.admin.email);
      } catch {
        // Non-fatal — the top bar just won't show an email.
      }
    })();
  }, []);

  // Close the mobile drawer automatically whenever the route changes.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  };

  return (
    <div className="cc-admin-shell">
      <div
        className={`cc-admin-sidebar-overlay ${mobileNavOpen ? "open" : ""}`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />

      <aside className={`cc-admin-sidebar ${mobileNavOpen ? "open" : ""}`}>
        <Link href="/" className="cc-admin-brand text-decoration-none d-flex align-items-center">
          <img src="/logo-mark.png" alt="" className="cc-brand-mark" />
          Creative <span>Corner</span>
        </Link>
        <div className="cc-admin-sidebar-label">Admin Panel</div>
        <nav className="cc-admin-nav">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`cc-admin-nav-link ${active ? "active" : ""}`}
              >
                <span className="cc-admin-nav-icon">
                  <Icon name={link.icon} size={16} />
                </span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="cc-admin-account-card">
          <div className="cc-admin-access-row">
            <span>Admin access</span>
            <span className="cc-admin-active-status"><i /> ACTIVE</span>
          </div>
          <div className="cc-admin-account-info">
            <div className="cc-admin-avatar" aria-hidden="true">A</div>
            <div className="cc-admin-account-text">
              <strong>Admin</strong>
              <span>{adminEmail || "admin@creativecorner.com"}</span>
            </div>
          </div>
          <a href="/" className="cc-admin-live-site">
            <span aria-hidden="true">↗</span>
            View live site
          </a>
        </div>
      </aside>

      <div className="cc-admin-main">
        <header className="cc-admin-topbar">
          <button
            type="button"
            className="cc-admin-mobile-toggle"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? "✕" : "☰"}
          </button>
          <div className="d-flex align-items-center gap-3">
            <NotificationBell />
            {adminEmail && (
              <span className="small text-muted-soft">{adminEmail}</span>
            )}
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Logging out…" : "Log Out"}
            </button>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
