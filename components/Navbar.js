"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/packages", label: "Packages" },
  { href: "/gallery", label: "Gallery" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" },
  { href: "/track-booking", label: "Track Booking" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Admin Panel has its own sidebar/topbar (see app/admin/(protected)/layout.js)
  // — the public marketing navbar doesn't belong there.
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className={`cc-navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="container d-flex align-items-center justify-content-between">
        <Link href="/" className="cc-brand text-decoration-none d-flex align-items-center">
          <img src="/logo-mark.png" alt="" className="cc-brand-mark" />
          Creative <span>Corner</span>
        </Link>

        <button
          className="btn d-lg-none border-0 p-1"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>
            {open ? "\u2715" : "\u2630"}
          </span>
        </button>

        <div className="d-none d-lg-flex align-items-center">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`cc-nav-link ${pathname === l.href ? "active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/booking" className="btn btn-cc-gold ms-3">
            Book Your Event
          </Link>
        </div>
      </div>

      {open && (
        <div className="d-lg-none container pt-3 pb-2 d-flex flex-column">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="cc-nav-link py-2"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/booking" className="btn btn-cc-gold mt-3">
            Book Your Event
          </Link>
        </div>
      )}
    </nav>
  );
}
