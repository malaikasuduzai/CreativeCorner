"use client";
import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [sent, setSent] = useState(false);

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Please enter your name.";
    if (!form.email.trim()) newErrors.email = "Please enter your email.";
    else if (!EMAIL_RE.test(form.email.trim()))
      newErrors.email = "Please enter a valid email address.";
    if (!form.subject.trim()) newErrors.subject = "Please enter a subject.";
    if (!form.message.trim()) newErrors.message = "Please enter a message.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          subject: form.subject,
          message: form.message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.message || "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setSubmitError("We couldn't reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(rgba(33,29,26,0.75), rgba(33,29,26,0.75)), url('https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1600&auto=format&fit=crop') center/cover no-repeat",
          color: "#fff",
        }}
      >
        <div className="container text-center py-5">
          <span className="eyebrow" style={{ color: "var(--cc-gold-light)" }}>
            Get In Touch
          </span>
          <h1 className="mb-2">Contact Us</h1>
          <p className="mb-0" style={{ color: "rgba(255,255,255,0.85)" }}>
            Have a question or want to talk through your event? Send us a message.
          </p>
        </div>
      </section>

      <section className="py-5 py-md-6">
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-7">
              <div className="cc-booking-card">
                {sent ? (
                  <div className="text-center py-4">
                    <div className="cc-success-icon">&#10003;</div>
                    <h3 className="mb-2">Message Sent</h3>
                    <p className="text-muted-soft mb-4">
                      Thanks for reaching out — our team will get back to you shortly.
                    </p>
                    <button
                      type="button"
                      className="btn btn-cc-gold"
                      onClick={() => setSent(false)}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="cc-form-label">
                          Name <span className="text-gold">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control cc-form-control"
                          placeholder="e.g. Sara Khan"
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                        />
                        {errors.name && <div className="cc-field-error">{errors.name}</div>}
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
                        <label className="cc-form-label">Phone (optional)</label>
                        <input
                          type="tel"
                          className="form-control cc-form-control"
                          placeholder="e.g. 0300 1234567"
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="cc-form-label">
                          Subject <span className="text-gold">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control cc-form-control"
                          placeholder="e.g. Wedding enquiry"
                          value={form.subject}
                          onChange={(e) => update("subject", e.target.value)}
                        />
                        {errors.subject && <div className="cc-field-error">{errors.subject}</div>}
                      </div>
                      <div className="col-12">
                        <label className="cc-form-label">
                          Message <span className="text-gold">*</span>
                        </label>
                        <textarea
                          className="form-control cc-form-control"
                          rows={5}
                          placeholder="Tell us a bit about your event…"
                          value={form.message}
                          onChange={(e) => update("message", e.target.value)}
                        />
                        {errors.message && <div className="cc-field-error">{errors.message}</div>}
                      </div>
                    </div>

                    {submitError && (
                      <div className="alert alert-danger mt-3 mb-0">{submitError}</div>
                    )}

                    <div className="mt-4 pt-3 border-top text-center">
                      <button
                        type="submit"
                        className="btn btn-cc-gold"
                        disabled={submitting}
                      >
                        {submitting ? "Sending…" : "Send Message"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
