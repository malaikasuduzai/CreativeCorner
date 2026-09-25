"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Modal } from "react-bootstrap";
import Reveal from "@/components/Reveal";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop";

function parseServices(services) {
  if (!services) return [];
  return services
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Builds the full gallery for an event: its primary imageUrl plus any extra
// images from the comma-separated `images` field, de-duplicated, with a
// fallback so there's always at least one image to show.
function parseEventImages(ev) {
  if (!ev) return [FALLBACK_IMG];
  const extra = (ev.images || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const all = [ev.imageUrl, ...extra].filter(Boolean);
  const unique = Array.from(new Set(all));
  return unique.length > 0 ? unique : [FALLBACK_IMG];
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  const openEvent = (ev) => {
    setSelected(ev);
    setActiveImage(0);
  };

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        // Only completed events are shown in the public portfolio (spec section 23).
        const res = await fetch("/api/events?completed=true", { signal: controller.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load events");
        setEvents(data.events || []);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const eventTypes = useMemo(() => {
    const unique = Array.from(new Set(events.map((e) => e.eventType))).sort();
    return ["All", ...unique];
  }, [events]);

  const filtered =
    filter === "All" ? events : events.filter((e) => e.eventType === filter);

  return (
    <main>
      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(rgba(33,29,26,0.75), rgba(33,29,26,0.75)), url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600&auto=format&fit=crop') center/cover no-repeat",
          color: "#fff",
        }}
      >
        <div className="container text-center py-5">
          <span className="eyebrow" style={{ color: "var(--cc-gold-light)" }}>
            Our Portfolio
          </span>
          <h1 className="mb-2">Previous Events</h1>
          <p className="mb-0" style={{ color: "rgba(255,255,255,0.85)" }}>
            A selection of the weddings, conferences and celebrations we&apos;ve managed.
          </p>
        </div>
      </section>

      <section className="py-5 py-md-6">
        <div className="container py-4">
          {loading && (
            <p className="text-center text-muted-soft py-5 mb-0">Loading portfolio…</p>
          )}

          {!loading && error && (
            <div className="alert alert-danger text-center">{error}</div>
          )}

          {!loading && !error && events.length === 0 && (
            <p className="text-center text-muted-soft py-5 mb-0">
              No completed events to show yet — please check back soon.
            </p>
          )}

          {!loading && !error && events.length > 0 && (
            <>
              <Reveal className="d-flex flex-wrap justify-content-center gap-2 mb-5">
                {eventTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFilter(t)}
                    className={`cc-filter-btn ${filter === t ? "active" : ""}`}
                  >
                    {t}
                  </button>
                ))}
              </Reveal>

              <div className="row g-4">
                {filtered.map((ev, i) => (
                  <div className="col-md-6 col-lg-4" key={ev.id}>
                    <Reveal delay={(i % 3) * 100} className="h-100">
                      <div className="cc-card d-flex flex-column h-100">
                        <img
                          src={ev.imageUrl || FALLBACK_IMG}
                          alt={ev.name}
                          className="cc-card-img"
                        />
                        <div className="cc-card-body d-flex flex-column flex-grow-1">
                          <span className="cc-card-price small mb-1">{ev.eventType}</span>
                          <h5 className="mb-1">{ev.name}</h5>
                          <p className="small text-muted-soft mb-3">
                            {formatDate(ev.date)} &middot; {ev.location}
                          </p>
                          <p className="text-muted-soft small mb-3">{ev.description}</p>
                          <button
                            type="button"
                            className="btn btn-cc-gold btn-sm mt-auto"
                            onClick={() => openEvent(ev)}
                          >
                            View Event Details
                          </button>
                        </div>
                      </div>
                    </Reveal>
                  </div>
                ))}
              </div>

              {filtered.length === 0 && (
                <p className="text-center text-muted-soft mt-5 mb-0">
                  No events in this category yet.
                </p>
              )}
            </>
          )}
        </div>
      </section>

      <section className="cc-cta-band py-5">
        <div className="container text-center py-3">
          <h2 className="mb-3">Want an Event Like This?</h2>
          <p className="mb-4" style={{ color: "rgba(255,255,255,0.85)" }}>
            Tell us the details and we&apos;ll bring the same care to your event.
          </p>
          <Link href="/booking" className="btn btn-cc-gold btn-lg">
            Book Your Event
          </Link>
        </div>
      </section>

      <Modal show={!!selected} onHide={() => setSelected(null)} centered size="lg">
        {selected && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selected.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {(() => {
                const gallery = parseEventImages(selected);
                const current = gallery[activeImage] || gallery[0];
                return (
                  <div className="mb-3">
                    <img
                      src={current}
                      alt={selected.name}
                      className="cc-event-modal-img cc-event-modal-img-main w-100"
                    />
                    {gallery.length > 1 && (
                      <div className="cc-event-modal-thumbs">
                        {gallery.map((src, i) => (
                          <button
                            key={`${src}-${i}`}
                            type="button"
                            className={`cc-event-modal-thumb ${
                              i === activeImage ? "active" : ""
                            }`}
                            onClick={() => setActiveImage(i)}
                            aria-label={`View image ${i + 1} of ${selected.name}`}
                          >
                            <img src={src} alt="" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="row g-3 mb-3">
                <div className="col-sm-4">
                  <div className="small text-muted-soft">Event Type</div>
                  <div className="fw-semibold">{selected.eventType}</div>
                </div>
                <div className="col-sm-4">
                  <div className="small text-muted-soft">Event Date</div>
                  <div className="fw-semibold">{formatDate(selected.date)}</div>
                </div>
                <div className="col-sm-4">
                  <div className="small text-muted-soft">Location</div>
                  <div className="fw-semibold">{selected.location}</div>
                </div>
              </div>

              <p className="text-muted-soft mb-3">{selected.description}</p>

              {parseServices(selected.services).length > 0 && (
                <>
                  <div className="small text-muted-soft mb-2">Services Provided</div>
                  <div className="d-flex flex-wrap gap-2">
                    {parseServices(selected.services).map((s) => (
                      <span key={s} className="cc-chip">
                        {s}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Link href="/booking" className="btn btn-cc-gold">
                Book a Similar Event
              </Link>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </main>
  );
}
