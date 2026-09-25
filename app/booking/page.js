"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const EVENT_TYPES = [
  "Wedding",
  "Corporate",
  "Birthday",
  "Engagement",
  "Conference",
  "Seminar",
  "Private Party",
  "Bridal",
];

const STEPS = [
  { key: "event", label: "Event" },
  { key: "package", label: "Package" },
  { key: "date", label: "Date" },
  { key: "location", label: "Location" },
  { key: "client", label: "Details" },
  { key: "requirements", label: "Requirements" },
  { key: "review", label: "Review" },
];

// Additional Requirements broken into categories (spec section 12) instead of
// one generic free-text box.
const REQUIREMENT_FIELDS = [
  { key: "decorationRequirements", label: "Decoration Requirements", placeholder: "e.g. Pastel florals, gold accents…" },
  { key: "cateringRequirements", label: "Catering Requirements", placeholder: "e.g. Vegetarian options, live counters…" },
  { key: "photographyRequirements", label: "Photography Requirements", placeholder: "e.g. Full-day coverage, drone shots…" },
  { key: "stageRequirements", label: "Stage Requirements", placeholder: "e.g. Backdrop theme, seating for speeches…" },
  { key: "lightingRequirements", label: "Lighting Requirements", placeholder: "e.g. Warm ambient lighting, spotlights…" },
  { key: "specialInstructions", label: "Special Instructions", placeholder: "Anything else our team should know…" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function todayISO() {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d - tzOffset).toISOString().slice(0, 10);
}

// Earliest selectable date, given the "Minimum Notice (days)" admin setting.
function earliestISO(noticeDays) {
  const d = new Date();
  d.setDate(d.getDate() + Math.max(0, Number(noticeDays) || 0));
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d - tzOffset).toISOString().slice(0, 10);
}

function BookingWizard() {
  const searchParams = useSearchParams();
  const preselectedPackage = searchParams.get("package");

  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  // Date-conflict awareness (spec section 13): flags when a chosen date
  // already has an active booking, so the client knows it may need admin
  // confirmation. It never blocks selecting the date.
  const [availability, setAvailability] = useState({ status: "idle", data: null });

  const [form, setForm] = useState({
    eventType: "",
    eventName: "",
    guestCount: "",
    packageName: "",
    eventDate: "",
    venue: "",
    address: "",
    city: "",
    fullName: "",
    phone: "",
    email: "",
    whatsapp: "",
    decorationRequirements: "",
    cateringRequirements: "",
    photographyRequirements: "",
    stageRequirements: "",
    lightingRequirements: "",
    specialInstructions: "",
  });

  // Booking rules (minimum notice, on-page notice text) are editable from the
  // Admin Panel at /admin/settings and read live here.
  const [bookingRules, setBookingRules] = useState({ minNoticeDays: 0, bookingNotice: "" });

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/settings", { signal: controller.signal });
        const data = await res.json();
        if (res.ok && data.settings) {
          setBookingRules({
            minNoticeDays: Number(data.settings.minNoticeDays) || 0,
            bookingNotice: data.settings.bookingNotice || "",
          });
        }
      } catch {
        // Non-fatal — the wizard falls back to "no minimum notice".
      }
    })();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/packages", { signal: controller.signal });
        const data = await res.json();
        if (res.ok) setPackages(data.packages || []);
      } catch (err) {
        // Non-fatal — the package step just falls back to a "no packages yet" state.
      } finally {
        setPackagesLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (preselectedPackage && packages.length > 0) {
      const match = packages.find(
        (p) => p.name.toLowerCase() === preselectedPackage.toLowerCase()
      );
      if (match) {
        setForm((f) => ({ ...f, packageName: match.name }));
      }
    }
  }, [preselectedPackage, packages]);

  // Debounced date-conflict check whenever the chosen event date changes.
  useEffect(() => {
    if (!form.eventDate) {
      setAvailability({ status: "idle", data: null });
      return;
    }
    setAvailability({ status: "checking", data: null });
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/bookings/availability?date=${encodeURIComponent(form.eventDate)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        if (!res.ok) throw new Error();
        setAvailability({ status: "done", data });
      } catch (err) {
        if (err.name !== "AbortError") setAvailability({ status: "idle", data: null });
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [form.eventDate]);

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 0) {
      if (!form.eventType) newErrors.eventType = "Please select an event type.";
      if (!form.guestCount || Number(form.guestCount) <= 0)
        newErrors.guestCount = "Please enter an expected guest count.";
    }
    if (step === 1) {
      if (!form.packageName) newErrors.packageName = "Please select a package.";
    }
    if (step === 2) {
      if (!form.eventDate) newErrors.eventDate = "Please choose your event date.";
      else if (form.eventDate < todayISO())
        newErrors.eventDate = "Event date can't be in the past.";
      else if (form.eventDate < earliestISO(bookingRules.minNoticeDays))
        newErrors.eventDate = `We need at least ${bookingRules.minNoticeDays} day${
          bookingRules.minNoticeDays === 1 ? "" : "s"
        } notice — please pick a later date.`;
    }
    if (step === 3) {
      if (!form.venue.trim()) newErrors.venue = "Please enter a venue.";
      if (!form.address.trim()) newErrors.address = "Please enter an address.";
      if (!form.city.trim()) newErrors.city = "Please enter a city.";
    }
    if (step === 4) {
      if (!form.fullName.trim()) newErrors.fullName = "Please enter your full name.";
      if (!form.phone.trim()) newErrors.phone = "Please enter a phone number.";
      if (!form.email.trim()) newErrors.email = "Please enter an email address.";
      else if (!EMAIL_RE.test(form.email.trim()))
        newErrors.email = "Please enter a valid email address.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const progressPct = useMemo(
    () => (step / (STEPS.length - 1)) * 100,
    [step]
  );

  const selectedPackage = packages.find((p) => p.name === form.packageName);
  const filledRequirements = REQUIREMENT_FIELDS.filter((f) => form[f.key]?.trim());

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: form.eventType,
          eventName: form.eventName || undefined,
          guestCount: Number(form.guestCount),
          packageName: form.packageName || undefined,
          eventDate: form.eventDate,
          venue: form.venue,
          address: form.address,
          city: form.city,
          decorationRequirements: form.decorationRequirements || undefined,
          cateringRequirements: form.cateringRequirements || undefined,
          photographyRequirements: form.photographyRequirements || undefined,
          stageRequirements: form.stageRequirements || undefined,
          lightingRequirements: form.lightingRequirements || undefined,
          specialInstructions: form.specialInstructions || undefined,
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          whatsapp: form.whatsapp || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.message || "Something went wrong. Please try again.");
        return;
      }

      setConfirmation(data.booking);
    } catch (err) {
      setSubmitError("We couldn't reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <main>
        <section className="py-5 py-md-6">
          <div className="container py-4">
            <div className="row justify-content-center">
              <div className="col-lg-7">
                <div className="cc-booking-card text-center">
                  <div className="cc-success-icon">&#10003;</div>
                  <h3 className="mb-2">Booking Request Submitted Successfully!</h3>
                  <p className="text-muted-soft mb-4">
                    Thank you, {confirmation.client?.fullName || form.fullName}. Our team will reach
                    out on {confirmation.client?.phone || form.phone} to confirm the details.
                  </p>

                  <div className="cc-review-row">
                    <span className="cc-review-label">Booking Reference ID</span>
                    <span className="cc-review-value">{confirmation.bookingRef}</span>
                  </div>
                  <div className="cc-review-row">
                    <span className="cc-review-label">Event Type</span>
                    <span className="cc-review-value">{confirmation.eventType}</span>
                  </div>
                  <div className="cc-review-row">
                    <span className="cc-review-label">Event Date</span>
                    <span className="cc-review-value">
                      {new Date(confirmation.eventDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="cc-review-row">
                    <span className="cc-review-label">Venue</span>
                    <span className="cc-review-value">
                      {confirmation.venue}, {confirmation.city}
                    </span>
                  </div>
                  <div className="cc-review-row">
                    <span className="cc-review-label">Status</span>
                    <span className="cc-review-value">{confirmation.status}</span>
                  </div>

                  <div className="mt-4 d-flex justify-content-center gap-2 flex-wrap">
                    <Link href={`/track-booking?ref=${encodeURIComponent(confirmation.bookingRef)}`} className="btn btn-cc-gold">Track Booking</Link>
                  </div>

                  <a href="/" className="btn btn-cc-gold mt-4">
                    Back to Home
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(rgba(33,29,26,0.75), rgba(33,29,26,0.75)), url('https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1600&auto=format&fit=crop') center/cover no-repeat",
          color: "#fff",
        }}
      >
        <div className="container text-center py-5">
          <span className="eyebrow" style={{ color: "var(--cc-gold-light)" }}>
            Let&apos;s Plan Your Event
          </span>
          <h1 className="mb-2">Book Your Event</h1>
          <p className="mb-0" style={{ color: "rgba(255,255,255,0.85)" }}>
            A few quick steps and our team will be in touch to confirm the details.
          </p>
        </div>
      </section>

      <section className="py-5 py-md-6">
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div className="cc-booking-card">
                <ul className="cc-stepper">
                  {STEPS.map((s, i) => (
                    <li
                      key={s.key}
                      className={`cc-stepper-item ${
                        i === step ? "active" : i < step ? "done" : ""
                      }`}
                    >
                      <span className="cc-step-circle">
                        {i < step ? "\u2713" : i + 1}
                      </span>
                      <span className="cc-step-label">{s.label}</span>
                    </li>
                  ))}
                </ul>

                {step === 0 && (
                  <div className="cc-booking-step-content">
                    <h4 className="mb-1">Tell us about your event</h4>
                    <p className="text-muted-soft small mb-4">
                      What are you celebrating, and how many guests should we plan for?
                    </p>

                    <div className="mb-4">
                      <label className="cc-form-label d-block">
                        Event Type <span className="text-gold">*</span>
                      </label>
                      <div className="row g-2">
                        {EVENT_TYPES.map((type) => (
                          <div className="col-6 col-md-3" key={type}>
                            <button
                              type="button"
                              onClick={() => update("eventType", type)}
                              className={`cc-option-card text-center py-3 ${
                                form.eventType === type ? "selected" : ""
                              }`}
                            >
                              <span className="cc-option-card-title d-block" style={{ fontSize: "0.9rem" }}>
                                {type}
                              </span>
                            </button>
                          </div>
                        ))}
                      </div>
                      {errors.eventType && (
                        <div className="cc-field-error">{errors.eventType}</div>
                      )}
                    </div>

                    <div className="row g-3">
                      <div className="col-md-7">
                        <label className="cc-form-label">Event Name (optional)</label>
                        <input
                          type="text"
                          className="form-control cc-form-control"
                          placeholder="e.g. Ali & Sara's Wedding"
                          value={form.eventName}
                          onChange={(e) => update("eventName", e.target.value)}
                        />
                      </div>
                      <div className="col-md-5">
                        <label className="cc-form-label">
                          Expected Guest Count <span className="text-gold">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="form-control cc-form-control"
                          placeholder="e.g. 150"
                          value={form.guestCount}
                          onChange={(e) => update("guestCount", e.target.value)}
                        />
                        {errors.guestCount && (
                          <div className="cc-field-error">{errors.guestCount}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="cc-booking-step-content">
                    <h4 className="mb-1">Choose a package</h4>
                    <p className="text-muted-soft small mb-4">
                      Pick a bundle to start from — you can fine-tune the details with our team later.
                    </p>

                    {packagesLoading && (
                      <p className="text-muted-soft small">Loading packages…</p>
                    )}

                    {!packagesLoading && packages.length === 0 && (
                      <p className="text-muted-soft small">
                        No packages are available right now — you can still continue and our team
                        will help you build a custom plan.
                      </p>
                    )}

                    {!packagesLoading && packages.length > 0 && (
                      <div className="row g-3">
                        {packages.map((p) => {
                          const includes = (p.features || "")
                            .split(",")
                            .map((f) => f.trim())
                            .filter(Boolean);
                          return (
                            <div className="col-md-6" key={p.id}>
                              <button
                                type="button"
                                onClick={() => update("packageName", p.name)}
                                className={`cc-option-card h-100 ${
                                  form.packageName === p.name ? "selected" : ""
                                }`}
                              >
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <span className="cc-option-card-title d-block">{p.name}</span>
                                  </div>
                                  <span className="cc-option-card-check">&#10003;</span>
                                </div>
                                <div className="fw-bold text-gold mb-2">
                                  PKR {Number(p.price).toLocaleString()}
                                </div>
                                {includes.length > 0 && (
                                  <ul className="mb-0 ps-3 small text-muted-soft">
                                    {includes.map((inc) => (
                                      <li key={inc}>{inc}</li>
                                    ))}
                                  </ul>
                                )}
                              </button>
                            </div>
                          );
                        })}
                        <div className="col-md-6">
                          <button
                            type="button"
                            onClick={() => update("packageName", "Custom / No Package")}
                            className={`cc-option-card h-100 ${
                              form.packageName === "Custom / No Package" ? "selected" : ""
                            }`}
                          >
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <span className="cc-option-card-title d-block">
                                  Custom / No Package
                                </span>
                                <span className="small text-muted-soft">
                                  Tell us what you need and we&apos;ll build a quote
                                </span>
                              </div>
                              <span className="cc-option-card-check">&#10003;</span>
                            </div>
                            <ul className="mb-0 ps-3 small text-muted-soft">
                              <li>Tailored to your requirements</li>
                              <li>Discussed with our team after booking</li>
                            </ul>
                          </button>
                        </div>
                      </div>
                    )}
                    {errors.packageName && (
                      <div className="cc-field-error">{errors.packageName}</div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="cc-booking-step-content">
                    <h4 className="mb-1">Pick your date</h4>
                    <p className="text-muted-soft small mb-4">
                      Choose the date you&apos;d like to hold your event. We&apos;ll confirm venue
                      availability once your booking request is submitted.
                    </p>

                    {bookingRules.minNoticeDays > 0 && (
                      <p className="text-muted-soft small mb-4">
                        We ask for at least {bookingRules.minNoticeDays} day
                        {bookingRules.minNoticeDays === 1 ? "" : "s"} notice, so the
                        earliest date you can pick is{" "}
                        <strong>
                          {new Date(
                            earliestISO(bookingRules.minNoticeDays)
                          ).toLocaleDateString()}
                        </strong>
                        .
                      </p>
                    )}

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="cc-form-label">
                          Event Date <span className="text-gold">*</span>
                        </label>
                        <input
                          type="date"
                          min={earliestISO(bookingRules.minNoticeDays)}
                          className="form-control cc-form-control"
                          value={form.eventDate}
                          onChange={(e) => update("eventDate", e.target.value)}
                        />
                        {errors.eventDate && (
                          <div className="cc-field-error">{errors.eventDate}</div>
                        )}
                      </div>
                    </div>

                    {form.eventDate && availability.status === "checking" && (
                      <p className="text-muted-soft small mt-3 mb-0">
                        Checking availability for this date…
                      </p>
                    )}

                    {form.eventDate &&
                      availability.status === "done" &&
                      availability.data &&
                      !availability.data.available && (
                        <div className="alert alert-warning small mt-3 mb-0">
                          <strong>Heads up:</strong> {availability.data.count} other booking
                          {availability.data.count === 1 ? " is" : "s are"} already on this date.
                          You can still request it — our team will confirm availability and reach
                          out if the date needs to change.
                        </div>
                      )}

                    {form.eventDate &&
                      availability.status === "done" &&
                      availability.data &&
                      availability.data.available && (
                        <div className="small mt-3 mb-0" style={{ color: "#1e7e42" }}>
                          &#10003; This date is currently open on our calendar.
                        </div>
                      )}

                    {bookingRules.bookingNotice && (
                      <p className="text-muted-soft small mt-3 mb-0">
                        {bookingRules.bookingNotice}
                      </p>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="cc-booking-step-content">
                    <h4 className="mb-1">Where will it be held?</h4>
                    <p className="text-muted-soft small mb-4">
                      Tell us the venue so our team can start checking availability.
                    </p>

                    <div className="row g-3">
                      <div className="col-12">
                        <label className="cc-form-label">
                          Venue Name <span className="text-gold">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control cc-form-control"
                          placeholder="e.g. Pearl Continental Ballroom"
                          value={form.venue}
                          onChange={(e) => update("venue", e.target.value)}
                        />
                        {errors.venue && <div className="cc-field-error">{errors.venue}</div>}
                      </div>
                      <div className="col-md-8">
                        <label className="cc-form-label">
                          Address <span className="text-gold">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control cc-form-control"
                          placeholder="Street, area / landmark"
                          value={form.address}
                          onChange={(e) => update("address", e.target.value)}
                        />
                        {errors.address && <div className="cc-field-error">{errors.address}</div>}
                      </div>
                      <div className="col-md-4">
                        <label className="cc-form-label">
                          City <span className="text-gold">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control cc-form-control"
                          placeholder="e.g. Rawalpindi"
                          value={form.city}
                          onChange={(e) => update("city", e.target.value)}
                        />
                        {errors.city && <div className="cc-field-error">{errors.city}</div>}
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="cc-booking-step-content">
                    <h4 className="mb-1">Your details</h4>
                    <p className="text-muted-soft small mb-4">
                      So our team knows who to confirm the booking with.
                    </p>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="cc-form-label">
                          Full Name <span className="text-gold">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control cc-form-control"
                          placeholder="e.g. Sara Khan"
                          value={form.fullName}
                          onChange={(e) => update("fullName", e.target.value)}
                        />
                        {errors.fullName && <div className="cc-field-error">{errors.fullName}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="cc-form-label">
                          Phone <span className="text-gold">*</span>
                        </label>
                        <input
                          type="tel"
                          className="form-control cc-form-control"
                          placeholder="e.g. 0300 1234567"
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                        />
                        {errors.phone && <div className="cc-field-error">{errors.phone}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="cc-form-label">
                          Email <span className="text-gold">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control cc-form-control"
                          placeholder="e.g. sara@email.com"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                        />
                        {errors.email && <div className="cc-field-error">{errors.email}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="cc-form-label">WhatsApp (optional)</label>
                        <input
                          type="tel"
                          className="form-control cc-form-control"
                          placeholder="If different from phone"
                          value={form.whatsapp}
                          onChange={(e) => update("whatsapp", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="cc-booking-step-content">
                    <h4 className="mb-1">Additional Requirements</h4>
                    <p className="text-muted-soft small mb-4">
                      Optional — tell us more about each area so our team can plan ahead.
                    </p>

                    <div className="row g-3">
                      {REQUIREMENT_FIELDS.map((f) => (
                        <div className="col-md-6" key={f.key}>
                          <label className="cc-form-label">{f.label}</label>
                          <textarea
                            className="form-control cc-form-control"
                            rows={3}
                            placeholder={f.placeholder}
                            value={form[f.key]}
                            onChange={(e) => update(f.key, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className="cc-booking-step-content">
                    <h4 className="mb-1">Review &amp; submit</h4>
                    <p className="text-muted-soft small mb-4">
                      Please check everything below before sending your booking request.
                    </p>

                    <div className="cc-review-row">
                      <span className="cc-review-label">Event Type</span>
                      <span className="cc-review-value">{form.eventType}</span>
                    </div>
                    {form.eventName && (
                      <div className="cc-review-row">
                        <span className="cc-review-label">Event Name</span>
                        <span className="cc-review-value">{form.eventName}</span>
                      </div>
                    )}
                    <div className="cc-review-row">
                      <span className="cc-review-label">Guest Count</span>
                      <span className="cc-review-value">{form.guestCount}</span>
                    </div>
                    <div className="cc-review-row">
                      <span className="cc-review-label">Package</span>
                      <span className="cc-review-value">
                        {form.packageName}
                        {selectedPackage?.price ? ` (PKR ${Number(selectedPackage.price).toLocaleString()})` : ""}
                      </span>
                    </div>
                    <div className="cc-review-row">
                      <span className="cc-review-label">Event Date</span>
                      <span className="cc-review-value">{form.eventDate}</span>
                    </div>
                    {availability.data && !availability.data.available && (
                      <div className="alert alert-warning small mb-3">
                        This date already has {availability.data.count} other booking
                        {availability.data.count === 1 ? "" : "s"} — it may need admin
                        confirmation before it's finalized.
                      </div>
                    )}
                    <div className="cc-review-row">
                      <span className="cc-review-label">Venue</span>
                      <span className="cc-review-value">{form.venue}</span>
                    </div>
                    <div className="cc-review-row">
                      <span className="cc-review-label">Address</span>
                      <span className="cc-review-value">
                        {form.address}, {form.city}
                      </span>
                    </div>
                    <div className="cc-review-row">
                      <span className="cc-review-label">Contact</span>
                      <span className="cc-review-value">
                        {form.fullName} &middot; {form.phone}
                      </span>
                    </div>
                    <div className="cc-review-row">
                      <span className="cc-review-label">Email</span>
                      <span className="cc-review-value">{form.email}</span>
                    </div>
                    {form.whatsapp && (
                      <div className="cc-review-row">
                        <span className="cc-review-label">WhatsApp</span>
                        <span className="cc-review-value">{form.whatsapp}</span>
                      </div>
                    )}
                    {filledRequirements.map((f) => (
                      <div className="cc-review-row" key={f.key}>
                        <span className="cc-review-label">{f.label}</span>
                        <span className="cc-review-value">{form[f.key]}</span>
                      </div>
                    ))}

                    {submitError && (
                      <div className="cc-field-error mt-3">{submitError}</div>
                    )}
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-cc-outline"
                    style={{ color: "var(--cc-gold)", borderColor: "var(--cc-gold)", background: "transparent" }}
                    onClick={goBack}
                    disabled={step === 0 || submitting}
                  >
                    Back
                  </button>

                  {step < STEPS.length - 1 ? (
                    <button type="button" className="btn btn-cc-gold" onClick={goNext}>
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-cc-gold"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit Booking Request"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={null}>
      <BookingWizard />
    </Suspense>
  );
}
