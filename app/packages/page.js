"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";

function parseFeatures(features) {
  if (!features) return [];
  return features
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);
}

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/packages", { signal: controller.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load packages");
        setPackages(data.packages || []);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  // The middle-priced package (if there are 3+) is highlighted as "Most Popular".
  const popularId =
    packages.length >= 3
      ? [...packages].sort((a, b) => a.price - b.price)[Math.floor(packages.length / 2)]?.id
      : null;

  return (
    <main>
      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(rgba(33,29,26,0.75), rgba(33,29,26,0.75)), url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop') center/cover no-repeat",
          color: "#fff",
        }}
      >
        <div className="container text-center py-5">
          <span className="eyebrow" style={{ color: "var(--cc-gold-light)" }}>
            Ready-Made Bundles
          </span>
          <h1 className="mb-2">Our Event Packages</h1>
          <p className="mb-0" style={{ color: "rgba(255,255,255,0.85)" }}>
            Simple, transparent bundles built around the way our clients actually book events.
          </p>
        </div>
      </section>

      <section className="py-5 py-md-6">
        <div className="container py-4">
          {loading && (
            <p className="text-center text-muted-soft py-5 mb-0">Loading packages…</p>
          )}

          {!loading && error && (
            <div className="alert alert-danger text-center">{error}</div>
          )}

          {!loading && !error && packages.length === 0 && (
            <p className="text-center text-muted-soft py-5 mb-0">
              No packages are available yet — please check back soon.
            </p>
          )}

          {!loading && !error && packages.length > 0 && (
            <div className="row g-4 justify-content-center">
              {packages.map((p, i) => {
                const includes = parseFeatures(p.features);
                const popular = p.id === popularId;
                return (
                  <div className="col-md-6 col-lg-4" key={p.id}>
                    <Reveal delay={i * 100} className="h-100">
                      <div
                        className={`cc-pkg-card h-100 d-flex flex-column ${
                          popular ? "cc-pkg-popular" : ""
                        }`}
                      >
                        {popular && <span className="cc-pkg-badge">Most Popular</span>}
                        <div className="text-center mb-3">
                          <h4 className="mb-1">{p.name}</h4>
                        </div>

                        <div className="text-center mb-4">
                          <span className="cc-pkg-price">
                            PKR {Number(p.price).toLocaleString()}
                          </span>
                          <span className="small text-muted-soft d-block">
                            starting price
                          </span>
                        </div>

                        <p className="text-muted-soft small mb-4 text-center">
                          {p.description}
                        </p>

                        {includes.length > 0 && (
                          <ul className="cc-pkg-list mb-4 flex-grow-1">
                            {includes.map((f) => (
                              <li key={f}>
                                <span className="cc-pkg-check">&#10003;</span>
                                {f}
                              </li>
                            ))}
                          </ul>
                        )}

                        <Link
                          href={`/booking?package=${encodeURIComponent(p.name)}`}
                          className="btn w-100 mt-auto btn-cc-gold"
                        >
                          Book This Package
                        </Link>
                      </div>
                    </Reveal>
                  </div>
                );
              })}
            </div>
          )}

          <Reveal className="text-center mt-5 pt-3">
            <p className="text-muted-soft mb-0">
              Need something in between? Every package can be customized to your
              guest count, venue and vision.{" "}
              <Link href="/contact" className="text-gold fw-semibold">
                Talk to our team
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>

      <section className="cc-cta-band py-5">
        <div className="container text-center py-3">
          <h2 className="mb-3">Prefer to Build Your Own Event?</h2>
          <p className="mb-4" style={{ color: "rgba(255,255,255,0.85)" }}>
            Pick individual services instead and we&apos;ll tailor a plan around them.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link href="/services" className="btn btn-cc-gold btn-lg">
              View Services
            </Link>
            <Link href="/booking" className="btn btn-cc-outline btn-lg">
              Start a Booking
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
