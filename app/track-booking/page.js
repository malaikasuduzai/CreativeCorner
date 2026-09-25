"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const TIMELINE = ["Submitted", "Under Review", "Confirmed", "In Progress", "Completed"];

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function statusIndex(status) {
  if (status === "Pending") return 0;
  if (status === "Under Review") return 1;
  if (status === "Confirmed") return 2;
  if (status === "In Progress") return 3;
  if (status === "Completed") return 4;
  return -1;
}

function TrackBookingContent() {
  const [bookingRef, setBookingRef] = useState("");
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setBookingRef(ref);
  }, [searchParams]);

  const trackBooking = async (e) => {
    e.preventDefault();
    setError("");
    setBooking(null);

    if (!bookingRef.trim()) {
      setError("Please enter your Booking Reference ID.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `/api/bookings/track?bookingRef=${encodeURIComponent(
          bookingRef.trim()
        )}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Booking not found.");
      }

      setBooking(data.booking);
    } catch (err) {
      setError(err.message || "Unable to track booking.");
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = booking ? statusIndex(booking.status) : -1;
  const isCancelled = booking?.status === "Cancelled";

  return (
    <main>
      <div className="cc-track-booking-page">
        <section className="cc-page-hero">
          <div className="container text-center">
            <span className="eyebrow">TRACK YOUR BOOKING</span>
            <h1>Track Your Booking</h1>
            <p>
              Enter your Booking Reference ID to get the latest request status.
            </p>
          </div>
        </section>

        <section className="cc-track-search-section">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="cc-booking-card p-4 p-md-5">

                  <form onSubmit={trackBooking}>
                    <label
                      className="cc-form-label"
                      htmlFor="booking-reference"
                    >
                      Enter Booking Reference ID
                    </label>

                    <div className="cc-track-input-group">
                      <input
                        id="booking-reference"
                        className="form-control cc-form-control"
                        value={bookingRef}
                        onChange={(e) => setBookingRef(e.target.value)}
                        placeholder="e.g. CC-2026-00125"
                        autoComplete="off"
                      />

                      {/* SAME ORIGINAL BUTTON */}
                      <button
                        className="btn btn-cc-gold cc-track-btn px-4"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Tracking..." : "Track"}
                      </button>
                    </div>
                  </form>

                  {error && (
                    <div className="alert alert-danger mt-3 mb-0">
                      {error}
                    </div>
                  )}

                  {booking && (
                    <div className="mt-4">
                      <div className="cc-review-row">
                        <span className="cc-review-label">
                          Booking Reference ID
                        </span>
                        <span className="cc-review-value">
                          {booking.bookingRef}
                        </span>
                      </div>

                      <div className="cc-review-row">
                        <span className="cc-review-label">Event</span>
                        <span className="cc-review-value">
                          {booking.eventType}
                        </span>
                      </div>

                      <div className="cc-review-row">
                        <span className="cc-review-label">Date</span>
                        <span className="cc-review-value">
                          {formatDate(booking.eventDate)}
                        </span>
                      </div>

                      <div className="cc-review-row">
                        <span className="cc-review-label">Status</span>
                        <span className="cc-review-value">
                          {isCancelled ? "Cancelled" : booking.status}
                        </span>
                      </div>

                      <div className="mt-4">
                        <h5 className="mb-3">Booking Progress</h5>

                        {isCancelled ? (
                          <div className="alert alert-danger mb-0">
                            Your booking has been cancelled.
                          </div>
                        ) : (
                          <div className="d-flex flex-wrap justify-content-between gap-3">
                            {TIMELINE.map((step, index) => {
                              const done = index <= currentIndex;
                              const active = index === currentIndex;

                              return (
                                <div
                                  key={step}
                                  className="text-center flex-fill"
                                  style={{ minWidth: 100 }}
                                >
                                  <div
                                    className="mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                      width: 34,
                                      height: 34,
                                      border:
                                        "2px solid var(--cc-gold)",
                                      background: done
                                        ? "var(--cc-gold)"
                                        : "transparent",
                                      color: done
                                        ? "#fff"
                                        : "var(--cc-gold)",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {done ? "✓" : "○"}
                                  </div>

                                  <small
                                    className={
                                      active
                                        ? "fw-bold"
                                        : "text-muted"
                                    }
                                  >
                                    {step}
                                  </small>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-center mt-4">
                    <Link
                      href="/booking"
                      className="btn btn-cc-outline"
                    >
                      Book Another Event
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function TrackBookingPage() {
  return (
    <Suspense fallback={null}>
      <TrackBookingContent />
    </Suspense>
  );
}