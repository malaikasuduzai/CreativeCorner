"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import NotificationsPanel from "@/components/admin/NotificationsPanel";
import Icon from "@/components/admin/Icon";

// Presentation-only metadata. lib/settings.js stays the single source of truth
// for what is editable — it groups fields into `section` (one card each) and
// `group` (a labelled block inside that card). Anything added there renders
// here automatically, just with a neutral icon if it isn't listed below.
const SECTION_META = {
  General: {
    icon: "spark",
    sub: "Identity, currency and time zone — the basics every other screen reads from.",
  },
  "Business Information": {
    icon: "building",
    sub: "Used across the public site — contact blocks, the footer and booking confirmations.",
  },
  "Social Links": {
    icon: "globe",
    sub: "Leave a field empty and that icon is simply hidden in the site footer.",
    cols: 3,
  },
  "Booking Settings": {
    icon: "calendar",
    sub: "Rules, approval flow and cancellation terms for every incoming booking.",
  },
  Notifications: {
    icon: "bell",
    sub: "Choose which events raise a notification, then review everything that has come in.",
  },
};

const GROUP_META = {
  Website: { icon: "image", sub: "Branding and regional defaults." },
  "Booking Rules": { icon: "sliders", sub: "How far ahead clients can book." },
  Confirmation: { icon: "checkCircle", sub: "What happens the moment a booking is submitted." },
  "Cancellation & Deposit": { icon: "creditCard", sub: "Your terms once a booking exists." },
  "Notification Preferences": {
    icon: "bell",
    sub: "Events switched off here never raise a notification at all.",
    cols: 2,
  },
};

// Per-field icon, placeholder and width. `full: true` spans the whole row.
const FIELD_META = {
  logoUrl: { icon: "image", placeholder: "https://…/logo.png" },
  faviconUrl: { icon: "star", placeholder: "https://…/favicon.png" },
  currency: { icon: "coin" },
  timezone: { icon: "clock" },

  businessName: { icon: "building", placeholder: "Creative Corner" },
  tagline: { icon: "tag", placeholder: "Crafting unforgettable celebrations" },
  contactEmail: { icon: "mail", placeholder: "hello@creativecorner.com" },
  contactPhone: { icon: "phone", placeholder: "+92 300 0000000" },
  whatsapp: { icon: "message", placeholder: "+92 300 0000000" },
  address: { icon: "pin", placeholder: "City & service area" },
  businessHours: { icon: "clock", placeholder: "Mon–Sat, 10:00 AM – 8:00 PM", full: true },

  facebookUrl: { icon: "facebook", placeholder: "https://facebook.com/yourpage" },
  instagramUrl: { icon: "instagram", placeholder: "https://instagram.com/yourpage" },
  linkedinUrl: { icon: "linkedin", placeholder: "https://linkedin.com/company/…" },

  minNoticeDays: { icon: "calendar", placeholder: "3" },
  maxBookingsPerDay: { icon: "layers", placeholder: "2" },
  bookingNotice: { icon: "file", full: true },

  confirmationMode: { icon: "checkCircle", full: true },

  cancellationAllowed: { icon: "ban", full: true },
  cancellationDeadlineHours: { icon: "clock", placeholder: "48" },
  cancellationPolicy: { icon: "file", full: true },
  depositRequired: { icon: "creditCard", full: true },
  depositType: { icon: "coin" },
  depositValue: { icon: "coin", placeholder: "25" },

  notifyNewBooking: { icon: "calendar" },
  notifyNewInquiry: { icon: "message" },
  notifyBookingCancellation: { icon: "ban" },
  notifyBookingConfirmation: { icon: "checkCircle" },
  notifyNewClient: { icon: "userPlus" },
  notifyByEmail: { icon: "mail", full: true },
};

// Kept in sync with CURRENCY_SYMBOLS in lib/settings.js. Duplicated rather
// than imported because lib/settings.js pulls in Prisma, which can't be
// bundled into a client component.
const CURRENCY_SYMBOLS = {
  PKR: "Rs",
  USD: "$",
  GBP: "£",
  EUR: "€",
  AED: "د.إ",
  SAR: "﷼",
};

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const isOn = (v) => v === true || v === "true";

function passwordScore(value) {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value) || /[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.min(3, score);
}
const STRENGTH = ["", "weak", "fair", "good"];
const STRENGTH_LABEL = ["", "Weak", "Fair", "Strong"];

function PasswordField({ label, value, onChange, help, autoComplete, children }) {
  const [show, setShow] = useState(false);
  return (
    <div className="cc-field">
      <label className="cc-form-label">{label}</label>
      <div className="cc-input-wrap has-action">
        <span className="cc-input-icon">
          <Icon name="lock" size={17} />
        </span>
        <input
          type={show ? "text" : "password"}
          className="form-control cc-form-control"
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          className="cc-input-action"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          title={show ? "Hide password" : "Show password"}
        >
          <Icon name={show ? "eyeOff" : "eye"} size={17} />
        </button>
      </div>
      {children}
      {help && <div className="cc-field-help">{help}</div>}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [schema, setSchema] = useState([]);
  const [values, setValues] = useState({});
  const [baseline, setBaseline] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [activeSection, setActiveSection] = useState("general");

  // Password form is kept separate from the settings form — different endpoint,
  // different failure modes, and you don't want a typo in a phone number to
  // block a password change.
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState("");

  const formTopRef = useRef(null);

  const loadSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load settings");
      setSchema(data.schema || []);
      setValues(data.settings || {});
      setBaseline(data.settings || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Success banners are transient — leaving "Settings saved" on screen forever
  // makes it unclear whether a later edit was saved too.
  useEffect(() => {
    if (!saved) return undefined;
    const t = setTimeout(() => setSaved(""), 5000);
    return () => clearTimeout(t);
  }, [saved]);

  useEffect(() => {
    if (!pwSaved) return undefined;
    const t = setTimeout(() => setPwSaved(""), 5000);
    return () => clearTimeout(t);
  }, [pwSaved]);

  // Collapse the flat group list the API returns into section -> groups.
  const sectionList = useMemo(() => {
    const out = [];
    schema.forEach((group) => {
      const name = group.section || group.group;
      let section = out.find((s) => s.name === name);
      if (!section) {
        section = { name, id: slugify(name), groups: [] };
        out.push(section);
      }
      section.groups.push(group);
    });
    return out;
  }, [schema]);

  const navSections = useMemo(
    () => [
      ...sectionList.map((s) => ({ id: s.id, label: s.name })),
      { id: "security", label: "Security" },
    ],
    [sectionList]
  );

  // Highlights the quick-nav pill for whichever section is nearest the top of
  // the viewport. Guarded so older browsers simply keep the default pill.
  useEffect(() => {
    if (loading || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: 0 }
    );
    navSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loading, navSections]);

  const dirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(baseline),
    [values, baseline]
  );

  const changedCount = useMemo(
    () => Object.keys(values).filter((k) => (values[k] ?? "") !== (baseline[k] ?? "")).length,
    [values, baseline]
  );

  const update = (key, value) => {
    setValues((v) =>
      // Favicon always mirrors the logo — one image, no second URL to keep
      // in sync by hand.
      key === "logoUrl" ? { ...v, logoUrl: value, faviconUrl: value } : { ...v, [key]: value }
    );
    setSaved("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save settings");
      setValues(data.settings || values);
      setBaseline(data.settings || values);
      setSaved("Settings saved. The public site picks these up immediately.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    // Discards local edits by reloading the stored values.
    if (dirty && !window.confirm("Discard your unsaved changes and reload the saved settings?")) {
      return;
    }
    loadSettings();
    setSaved("");
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSaved("");

    if (pw.newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (pw.newPassword !== pw.confirm) {
      setPwError("The two new password fields don't match.");
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pw.currentPassword,
          newPassword: pw.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      setPwSaved("Password updated.");
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwSaving(false);
    }
  };

  // A field is hidden until its controlling toggle/select has the right value.
  // Hidden fields keep their stored value — they're just not editable yet.
  const visible = (field) =>
    !field.showIf || String(values[field.showIf.key] ?? "") === String(field.showIf.equals);

  const renderField = (field) => {
    const meta = FIELD_META[field.key] || {};
    const value = values[field.key] ?? "";
    const changed = (baseline[field.key] ?? "") !== value;
    const spanFull = field.type === "textarea" || field.type === "toggle" || meta.full;

    const label = (
      <label className="cc-form-label" htmlFor={`set-${field.key}`}>
        {field.label}
        {changed && <span className="cc-changed-dot" title="Unsaved change" />}
      </label>
    );

    // --- Toggle: a switch row rather than a checkbox in a grid cell.
    if (field.type === "toggle") {
      const on = isOn(value);
      return (
        <div className={`cc-field ${spanFull ? "span-full" : ""}`} key={field.key}>
          <div className={`cc-toggle-row ${on ? "on" : ""}`}>
            <span className="cc-toggle-icon">
              <Icon name={meta.icon || "bell"} size={17} />
            </span>
            <span className="cc-toggle-text">
              <span className="cc-toggle-label">
                {field.label}
                {changed && <span className="cc-changed-dot" title="Unsaved change" />}
              </span>
              {field.help && <span className="cc-toggle-help">{field.help}</span>}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-label={field.label}
              className={`cc-switch ${on ? "on" : ""}`}
              onClick={() => update(field.key, on ? "false" : "true")}
            >
              <span className="cc-switch-knob" />
            </button>
          </div>
        </div>
      );
    }

    // --- Select
    if (field.type === "select") {
      return (
        <div className={`cc-field ${spanFull ? "span-full" : ""}`} key={field.key}>
          {label}
          <div className="cc-input-wrap select">
            <span className="cc-input-icon">
              <Icon name={meta.icon || "sliders"} size={17} />
            </span>
            <select
              id={`set-${field.key}`}
              className="form-select cc-form-control"
              value={value}
              onChange={(e) => update(field.key, e.target.value)}
            >
              {(field.options || []).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {field.help && <div className="cc-field-help">{field.help}</div>}
        </div>
      );
    }

    // --- Image URL, with a live thumbnail once the URL resolves.
    if (field.type === "image") {
      const isFavicon = field.key === "faviconUrl";
      return (
        <div className={`cc-field ${spanFull ? "span-full" : ""}`} key={field.key}>
          {label}
          <div className="cc-image-field">
            <span className="cc-image-preview">
              {value ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={value} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              ) : (
                <Icon name={meta.icon || "image"} size={20} />
              )}
            </span>
            <div className="cc-image-input">
              <div className={`cc-input-wrap ${isFavicon ? "is-locked" : ""}`}>
                <span className="cc-input-icon">
                  <Icon name={isFavicon ? "lock" : "globe"} size={17} />
                </span>
                <input
                  id={`set-${field.key}`}
                  type="text"
                  className="form-control cc-form-control"
                  value={value}
                  placeholder={meta.placeholder}
                  disabled={isFavicon}
                  readOnly={isFavicon}
                  onChange={(e) => update(field.key, e.target.value)}
                />
              </div>
              {field.help && <div className="cc-field-help">{field.help}</div>}
            </div>
          </div>
        </div>
      );
    }

    // --- Text / number / textarea
    const isTextarea = field.type === "textarea";
    const isNumber = field.type === "number";
    const common = {
      className: "form-control cc-form-control",
      value,
      placeholder: meta.placeholder,
      onChange: (e) => update(field.key, e.target.value),
    };

    return (
      <div className={`cc-field ${spanFull ? "span-full" : ""}`} key={field.key}>
        {label}
        <div className={`cc-input-wrap ${isTextarea ? "textarea" : ""}`}>
          <span className="cc-input-icon">
            <Icon name={meta.icon || "spark"} size={17} />
          </span>
          {isTextarea ? (
            <textarea id={`set-${field.key}`} rows={3} {...common} />
          ) : (
            <input
              id={`set-${field.key}`}
              type={isNumber ? "number" : "text"}
              min={isNumber ? "0" : undefined}
              inputMode={isNumber ? "numeric" : undefined}
              {...common}
            />
          )}
        </div>
        {field.help && <div className="cc-field-help">{field.help}</div>}
      </div>
    );
  };

  const renderGroup = (group, sectionName, showHeading) => {
    const gMeta = GROUP_META[group.group] || {};
    const sMeta = SECTION_META[sectionName] || {};
    const cols = gMeta.cols || sMeta.cols || 2;
    const fields = group.fields.filter(visible);

    return (
      <div className="cc-subsection" key={group.group}>
        {showHeading && (
          <>
            <div className="cc-subsection-head">
              <span className="cc-subsection-icon">
                <Icon name={gMeta.icon || "sliders"} size={16} />
              </span>
              <span className="cc-subsection-title">{group.group}</span>
              <span className="cc-subsection-count">
                {fields.length} field{fields.length === 1 ? "" : "s"}
              </span>
            </div>
            {gMeta.sub && <p className="cc-subsection-sub">{gMeta.sub}</p>}
          </>
        )}
        <div className={`cc-field-grid ${cols === 3 ? "cols-3" : ""}`}>
          {fields.map(renderField)}
        </div>
      </div>
    );
  };

  const pwScore = passwordScore(pw.newPassword);
  const pwMatch = pw.confirm.length > 0 && pw.newPassword === pw.confirm;
  const symbol = CURRENCY_SYMBOLS[values.currency] || values.currency || "Rs";

  return (
    <div className="container-fluid cc-settings-page py-4 py-lg-5 px-3 px-md-4">
      {/* Page hero */}
      <div className="cc-settings-hero">
        <div>
          <span className="eyebrow mb-1">Admin Panel</span>
          <h2 className="cc-settings-title">Settings</h2>
          <p className="cc-settings-hero-sub">
            Website basics, business details, booking rules, notifications and
            account security — all in one place.
          </p>
        </div>
        <div className="cc-settings-hero-meta">
          <span className={`cc-status-pill ${loading ? "loading" : dirty ? "dirty" : "ok"}`}>
            <span className="cc-status-dot" />
            {loading
              ? "Loading…"
              : dirty
              ? `${changedCount} unsaved change${changedCount === 1 ? "" : "s"}`
              : "All changes saved"}
          </span>
        </div>
      </div>

      {/* Sticky quick nav */}
      <nav className="cc-settings-nav" aria-label="Settings sections">
        {navSections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`cc-settings-nav-link ${activeSection === s.id ? "active" : ""}`}
            onClick={() => setActiveSection(s.id)}
          >
            {s.label}
          </a>
        ))}
      </nav>

      {error && (
        <div className="cc-alert err">
          <Icon name="alert" size={18} />
          <span>{error}</span>
        </div>
      )}
      {saved && (
        <div className="cc-alert ok">
          <Icon name="check" size={18} />
          <span>{saved}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} ref={formTopRef}>
        {loading && (
          <div className="cc-settings-section cc-admin-card">
            <div className="cc-section-head">
              <span className="cc-skeleton cc-skeleton-icon" />
              <div className="cc-section-head-text">
                <span className="cc-skeleton d-block mb-2" style={{ width: "32%", height: "1rem" }} />
                <span className="cc-skeleton d-block" style={{ width: "60%", height: "0.7rem" }} />
              </div>
            </div>
            <div className="cc-field-grid">
              {[0, 1, 2, 3].map((i) => (
                <div className="cc-field" key={i}>
                  <span className="cc-skeleton d-block mb-2" style={{ width: "35%", height: "0.7rem" }} />
                  <span className="cc-skeleton d-block" style={{ height: "2.7rem", borderRadius: "10px" }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading &&
          sectionList.map((section) => {
            const meta = SECTION_META[section.name] || {};
            const multi = section.groups.length > 1;
            const fieldTotal = section.groups.reduce(
              (n, g) => n + g.fields.filter(visible).length,
              0
            );

            return (
              <section
                className="cc-settings-section cc-admin-card"
                id={section.id}
                key={section.id}
              >
                <div className="cc-section-head">
                  <span className="cc-section-icon">
                    <Icon name={meta.icon || "sliders"} size={20} />
                  </span>
                  <div className="cc-section-head-text">
                    <h3 className="cc-section-title">{section.name}</h3>
                    {meta.sub && <p className="cc-section-sub">{meta.sub}</p>}
                  </div>
                  <span className="cc-section-count">
                    {fieldTotal} setting{fieldTotal === 1 ? "" : "s"}
                  </span>
                </div>

                {section.groups.map((group) => renderGroup(group, section.name, multi))}

                {/* Brand preview sits under the General fields so the effect of
                    a logo/currency change is visible without leaving the page. */}
                {section.name === "General" && (
                  <div className="cc-brand-preview">
                    <span className="cc-brand-preview-label">Preview</span>
                    <div className="cc-brand-preview-body">
                      <span className="cc-brand-logo">
                        {values.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={values.logoUrl} alt="" />
                        ) : (
                          (values.businessName || "CC").slice(0, 2).toUpperCase()
                        )}
                      </span>
                      <span className="cc-brand-text">
                        <span className="cc-brand-name">{values.businessName || "Creative Corner"}</span>
                        <span className="cc-brand-tagline">{values.tagline}</span>
                      </span>
                      <span className="cc-brand-meta">
                        <span>
                          Sample price <b>{symbol} 25,000</b>
                        </span>
                        <span>{values.timezone}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Notification history lives with the preferences that control
                    it — preferences decide what raises a notification, the
                    history shows what already did. */}
                {section.name === "Notifications" && <NotificationsPanel />}
              </section>
            );
          })}

        {!loading && (
          <div className="cc-settings-actionbar">
            <span className={`cc-dirty-pill ${dirty ? "on" : ""}`}>
              <span className="cc-dot-pulse" />
              {dirty
                ? `${changedCount} unsaved change${changedCount === 1 ? "" : "s"}`
                : "Everything is up to date"}
            </span>

            <div className="cc-actionbar-buttons">
              <button
                type="button"
                className="btn btn-cc-reset"
                onClick={handleReset}
                disabled={saving}
                title="Discard unsaved edits and reload saved values"
              >
                <Icon name="refresh" size={16} />
                Reset
              </button>
              <button type="submit" className="btn btn-cc-gold" disabled={saving || !dirty}>
                <Icon name={saving ? "refresh" : "check"} size={16} />
                {saving ? "Saving…" : "Save Settings"}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Security */}
      <section className="cc-settings-section cc-admin-card" id="security">
        <div className="cc-section-head">
          <span className="cc-section-icon">
            <Icon name="shield" size={20} />
          </span>
          <div className="cc-section-head-text">
            <h3 className="cc-section-title">Security</h3>
            <p className="cc-section-sub">
              Changes the password for the account you&apos;re signed in as. Any
              outstanding reset link is cancelled.
            </p>
          </div>
        </div>

        {pwError && (
          <div className="cc-alert err">
            <Icon name="alert" size={18} />
            <span>{pwError}</span>
          </div>
        )}
        {pwSaved && (
          <div className="cc-alert ok">
            <Icon name="check" size={18} />
            <span>{pwSaved}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div className="cc-subsection">
            <div className="cc-subsection-head">
              <span className="cc-subsection-icon">
                <Icon name="key" size={16} />
              </span>
              <span className="cc-subsection-title">Change Password</span>
            </div>

            <div className="cc-field-grid cols-3">
              <PasswordField
                label="Current Password"
                value={pw.currentPassword}
                autoComplete="current-password"
                onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))}
              />

              <PasswordField
                label="New Password"
                value={pw.newPassword}
                autoComplete="new-password"
                help="At least 8 characters. Mixing cases, numbers and symbols helps."
                onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
              >
                {pw.newPassword && (
                  <div className="cc-pw-meter" aria-hidden="true">
                    {[1, 2, 3].map((step) => (
                      <span
                        key={step}
                        className={`cc-pw-bar ${pwScore >= step ? `on ${STRENGTH[pwScore]}` : ""}`}
                      />
                    ))}
                    <span className={`cc-pw-label ${STRENGTH[pwScore]}`}>
                      {STRENGTH_LABEL[pwScore]}
                    </span>
                  </div>
                )}
              </PasswordField>

              <PasswordField
                label="Confirm New Password"
                value={pw.confirm}
                autoComplete="new-password"
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
              >
                {pw.confirm.length > 0 && (
                  <div className={`cc-match-note ${pwMatch ? "ok" : "no"}`}>
                    <Icon name={pwMatch ? "check" : "alert"} size={14} />
                    {pwMatch ? "Passwords match" : "Passwords don't match yet"}
                  </div>
                )}
              </PasswordField>
            </div>
          </div>

          <div className="cc-section-foot">
            <span className="cc-section-foot-note">
              <Icon name="key" size={15} />
              You&apos;ll stay signed in on this device after updating.
            </span>
            <button type="submit" className="btn btn-cc-gold" disabled={pwSaving}>
              <Icon name={pwSaving ? "refresh" : "lock"} size={16} />
              {pwSaving ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
