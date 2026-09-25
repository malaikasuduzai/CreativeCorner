"use client";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import Reveal from "@/components/Reveal";

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState("All");
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/gallery", { signal: controller.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load gallery");
        setItems(data.items || []);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map((i) => i.category))).sort();
    return ["All", ...unique];
  }, [items]);

  const filtered = useMemo(
    () => (active === "All" ? items : items.filter((g) => g.category === active)),
    [active, items]
  );

  return (
    <main>
      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(rgba(33,29,26,0.75), rgba(33,29,26,0.75)), url('https://images.unsplash.com/photo-1478146059778-26028b07395a?q=80&w=1600&auto=format&fit=crop') center/cover no-repeat",
          color: "#fff",
        }}
      >
        <div className="container text-center py-5">
          <span className="eyebrow" style={{ color: "var(--cc-gold-light)" }}>
            Our Work
          </span>
          <h1 className="mb-2">Event Gallery</h1>
          <p className="mb-0" style={{ color: "rgba(255,255,255,0.85)" }}>
            A closer look at the decor, stages and moments we&apos;ve brought to life.
          </p>
        </div>
      </section>

      <section className="py-5 py-md-6">
        <div className="container py-4">
          {loading && (
            <p className="text-center text-muted-soft py-5 mb-0">Loading gallery…</p>
          )}

          {!loading && error && (
            <div className="alert alert-danger text-center">{error}</div>
          )}

          {!loading && !error && items.length === 0 && (
            <p className="text-center text-muted-soft py-5 mb-0">
              No gallery images have been uploaded yet — please check back soon.
            </p>
          )}

          {!loading && !error && items.length > 0 && (
            <>
              <Reveal className="cc-gallery-filters d-flex flex-wrap justify-content-center gap-2 mb-5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActive(cat)}
                    className={`cc-filter-btn ${active === cat ? "active" : ""}`}
                    type="button"
                  >
                    {cat}
                  </button>
                ))}
              </Reveal>

              <div className="row g-4">
                {filtered.map((item, i) => (
                  <div className="col-6 col-md-4 col-lg-3" key={item.id}>
                    <Reveal delay={(i % 4) * 80} className="h-100">
                      <button
                        type="button"
                        className="cc-gallery-tile"
                        onClick={() => setPreview(item)}
                      >
                        <img src={item.imageUrl} alt={item.eventName} loading="lazy" />
                        <div className="cc-gallery-overlay">
                          <span className="cc-gallery-cat">{item.category}</span>
                          <span className="cc-gallery-name">{item.eventName}</span>
                        </div>
                      </button>
                    </Reveal>
                  </div>
                ))}
              </div>

              {filtered.length === 0 && (
                <p className="text-center text-muted-soft mt-5 mb-0">
                  No images in this category yet.
                </p>
              )}
            </>
          )}
        </div>
      </section>

      <Modal
        show={!!preview}
        onHide={() => setPreview(null)}
        centered
        size="lg"
        contentClassName="cc-lightbox-content"
      >
        {preview && (
          <>
            <img
              src={preview.imageUrl}
              alt={preview.eventName}
              className="cc-lightbox-img"
            />
            <div className="p-3 p-md-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h5 className="mb-1">{preview.eventName}</h5>
                <span className="small text-muted-soft">{preview.category}</span>
                {preview.description && (
                  <p className="small text-muted-soft mt-2 mb-0">{preview.description}</p>
                )}
              </div>
              <button
                className="btn btn-cc-dark btn-sm"
                onClick={() => setPreview(null)}
                type="button"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
    </main>
  );
}
