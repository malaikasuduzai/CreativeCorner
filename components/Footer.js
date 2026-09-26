"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

// Fallbacks match lib/settings.js defaults, so the footer renders correctly
// on the very first paint and even if the settings fetch fails.
const FALLBACK = {
  businessName: "Creative Corner",
  contactEmail: "hello@creativecorner.com",
  contactPhone: "+92 300 0000000",
  address: "Rawalpindi & Islamabad, Pakistan",
  businessHours: "Mon\u2013Sat, 10:00 AM \u2013 8:00 PM",
  facebookUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
};

export default function Footer() {
  const pathname = usePathname();
  const [settings, setSettings] = useState(FALLBACK);

  // Contact details are managed in the Admin Panel (/admin/settings) and read
  // live from GET /api/settings, so an admin edit shows up on the public site
  // on the next page load without a code change or redeploy.
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/settings", { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        if (data.settings) setSettings({ ...FALLBACK, ...data.settings });
      } catch {
        // Keep the fallbacks — the footer should never break the page.
      }
    })();
    return () => controller.abort();
  }, []);

  // Admin Panel has its own sidebar/topbar — skip the public site footer there.
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="cc-footer pt-5 pb-4">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <h6 className="font-display fs-5 text-white d-flex align-items-center">
              <img src="/logo-mark.png" alt="" className="cc-brand-mark" />
              Creative <span className="text-gold">Corner</span>
            </h6>
            <div className="cc-quote">
              <span className="cc-quote-mark">&ldquo;</span>
              <p className="mb-0">
                Every celebration is a story waiting to be told — we simply
                help you tell it beautifully.
              </p>
            </div>
            <div>
              <a
                href={settings.facebookUrl || "#"}
                className="cc-social-icon"
                aria-label="Facebook"
                target={settings.facebookUrl ? "_blank" : undefined}
                rel={settings.facebookUrl ? "noopener noreferrer" : undefined}
              >
                <Icon name="facebook" size={16} />
              </a>
              <a
                href={settings.instagramUrl || "#"}
                className="cc-social-icon"
                aria-label="Instagram"
                target={settings.instagramUrl ? "_blank" : undefined}
                rel={settings.instagramUrl ? "noopener noreferrer" : undefined}
              >
                <Icon name="instagram" size={16} />
              </a>
              <a
                href={settings.linkedinUrl || "#"}
                className="cc-social-icon"
                aria-label="LinkedIn"
                target={settings.linkedinUrl ? "_blank" : undefined}
                rel={settings.linkedinUrl ? "noopener noreferrer" : undefined}
              >
                <Icon name="linkedin" size={16} />
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6>Quick Links</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/packages">Packages</Link></li>
              <li><Link href="/gallery">Gallery</Link></li>
              <li><Link href="/events">Events</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6>Our Services</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link href="/services">Wedding Planning</Link></li>
              <li><Link href="/services">Corporate Events</Link></li>
              <li><Link href="/services">Birthday &amp; Private Parties</Link></li>
              <li><Link href="/services">Decoration &amp; Catering</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6>Get In Touch</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li>{settings.address}</li>
              <li>
                <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
              </li>
              <li>
                <a href={`tel:${(settings.contactPhone || "").replace(/\s+/g, "")}`}>
                  {settings.contactPhone}
                </a>
              </li>
              {settings.businessHours && <li>{settings.businessHours}</li>}
              <li><Link href="/contact">Contact Form</Link></li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary my-4" style={{ opacity: 0.2 }} />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small">
          <p className="mb-2 mb-md-0">
            &copy; {new Date().getFullYear()} {settings.businessName}. All rights
            reserved.
          </p>
          <p className="mb-0">Crafted with care for unforgettable events.</p>
        </div>
      </div>
    </footer>
  );
}
