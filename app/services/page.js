"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop";

function parseFeatures(features) {
  if (!features) return [];
  return features
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);
}

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/services", { signal: controller.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load services");
        setServices(data.services || []);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  return (
    <main>
      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(rgba(33,29,26,0.75), rgba(33,29,26,0.75)), url('https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop') center/cover no-repeat",
          color: "#fff",
        }}
      >
        <div className="container text-center py-5">
          <span className="eyebrow" style={{ color: "var(--cc-gold-light)" }}>
            What We Offer
          </span>
          <h1 className="mb-2">Our Event Services</h1>
          <p className="mb-0" style={{ color: "rgba(255,255,255,0.85)" }}>
            Every service you need to bring your event to life, under one roof.
          </p>
        </div>
      </section>

      <section className="py-5 py-md-6">
        <div className="container py-4">
          {loading && (
            <p className="text-center text-muted-soft py-5 mb-0">Loading services…</p>
          )}

          {!loading && error && (
            <div className="alert alert-danger text-center">{error}</div>
          )}

          {!loading && !error && services.length === 0 && (
            <p className="text-center text-muted-soft py-5 mb-0">
              No services are available yet — please check back soon.
            </p>
          )}

          {!loading && !error && services.length > 0 && (
            <div className="row g-4">
              {services.map((s, i) => {
                const features = parseFeatures(s.features);
                return (
                  <div className="col-md-6 col-lg-4" key={s.id}>
                    <Reveal delay={(i % 3) * 100} className="h-100">
                      <div className="cc-card d-flex flex-column">
                        <img
                          src={s.imageUrl || FALLBACK_IMG}
                          alt={s.name}
                          className="cc-card-img"
                        />
                        <div className="cc-card-body d-flex flex-column flex-grow-1">
                          <h5 className="mb-2">{s.name}</h5>
                          <p className="text-muted-soft small mb-3">{s.description}</p>
                          {features.length > 0 && (
                            <ul className="small text-muted-soft mb-3 ps-3">
                              {features.map((f) => (
                                <li key={f}>{f}</li>
                              ))}
                            </ul>
                          )}
                          <div className="mt-auto d-flex justify-content-between align-items-center">
                            {s.price != null ? (
                              <span className="cc-card-price small">
                                From PKR {Number(s.price).toLocaleString()}
                              </span>
                            ) : (
                              <span className="cc-card-price small">Price on request</span>
                            )}
                            <Link href="/booking" className="btn btn-sm btn-cc-gold">
                              Book Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="cc-cta-band py-5">
        <div className="container text-center py-3">
          <h2 className="mb-3">Not Sure Which Service You Need?</h2>
          <p className="mb-4" style={{ color: "rgba(255,255,255,0.85)" }}>
            Explore our ready-made packages or reach out and we&apos;ll help you plan.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link href="/packages" className="btn btn-cc-gold btn-lg">
              View Packages
            </Link>
            <Link href="/contact" className="btn btn-cc-outline btn-lg">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
