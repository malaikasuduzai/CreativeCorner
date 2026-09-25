import { prisma } from '@/lib/db';

// The full set of editable site settings. Each entry defines the key, a label
// for the admin form, the input type, and the value used when the database has
// no row for that key yet — which is also what the public site falls back to,
// so the site looks correct on a fresh install before anyone visits
// /admin/settings.
//
// Structure: the admin screen renders one card per `section`; a section may
// hold several `group`s, which become labelled blocks inside that card. Field
// types are: text | textarea | number | select | toggle | image.
//
//   - select fields carry `options: [{ value, label }]`
//   - toggle fields store the strings 'true' / 'false' (every Setting row is a
//     string in the database, so booleans are normalised on the way in and
//     read back with settingIsOn())
//   - image fields are URLs — the project has no file-upload endpoint (the
//     gallery stores imageUrl strings the same way), so the admin pastes a
//     hosted URL and gets a live preview.
//
// `showIf: { key, equals }` hides a field until its controlling field has that
// value — e.g. the cancellation deadline only matters when cancellations are
// allowed at all.

export const CURRENCY_OPTIONS = [
  { value: 'PKR', label: 'PKR — Pakistani Rupee (Rs)' },
  { value: 'USD', label: 'USD — US Dollar ($)' },
  { value: 'GBP', label: 'GBP — Pound Sterling (£)' },
  { value: 'EUR', label: 'EUR — Euro (€)' },
  { value: 'AED', label: 'AED — UAE Dirham (د.إ)' },
  { value: 'SAR', label: 'SAR — Saudi Riyal (﷼)' },
];

export const TIMEZONE_OPTIONS = [
  { value: 'Asia/Karachi', label: 'Asia/Karachi (PKT, UTC+5)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, UTC+4)' },
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh (AST, UTC+3)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'America/New_York', label: 'America/New_York (ET)' },
  { value: 'UTC', label: 'UTC' },
];

// Currency symbol for whatever `currency` is set to — used when formatting
// package prices and deposit amounts.
export const CURRENCY_SYMBOLS = {
  PKR: 'Rs',
  USD: '$',
  GBP: '£',
  EUR: '€',
  AED: 'د.إ',
  SAR: '﷼',
};

export const SETTINGS_SCHEMA = [
  /* ---------------- General / Website ---------------- */
  {
    section: 'General',
    group: 'Website',
    fields: [
      {
        key: 'logoUrl',
        label: 'Logo',
        type: 'image',
        default: '',
        help: 'Square or wide PNG/SVG URL. Leave empty to keep the text wordmark.',
      },
      {
        key: 'faviconUrl',
        label: 'Favicon',
        type: 'image',
        default: '',
        help: 'Mirrors your logo automatically — shown in the browser tab.',
      },
      {
        key: 'currency',
        label: 'Default Currency',
        type: 'select',
        options: CURRENCY_OPTIONS,
        default: 'PKR',
        help: 'Used for package prices, quotes and deposits.',
      },
      {
        key: 'timezone',
        label: 'Time Zone',
        type: 'select',
        options: TIMEZONE_OPTIONS,
        default: 'Asia/Karachi',
        help: 'Event dates and booking times are read in this zone.',
      },
    ],
  },

  /* ---------------- Business Information ---------------- */
  {
    section: 'Business Information',
    group: 'Business Information',
    fields: [
      { key: 'businessName', label: 'Business Name', type: 'text', default: 'Creative Corner' },
      { key: 'tagline', label: 'Tagline', type: 'text', default: 'Crafting unforgettable celebrations' },
      { key: 'contactEmail', label: 'Contact Email', type: 'text', default: 'hello@creativecorner.com' },
      { key: 'contactPhone', label: 'Contact Phone', type: 'text', default: '+92 300 0000000' },
      { key: 'whatsapp', label: 'WhatsApp Number', type: 'text', default: '+92 300 0000000' },
      { key: 'address', label: 'Address / Service Area', type: 'text', default: 'Rawalpindi & Islamabad, Pakistan' },
      { key: 'businessHours', label: 'Business Hours', type: 'text', default: 'Mon–Sat, 10:00 AM – 8:00 PM' },
    ],
  },

  /* ---------------- Social Links ---------------- */
  {
    section: 'Social Links',
    group: 'Social Links',
    fields: [
      { key: 'facebookUrl', label: 'Facebook URL', type: 'text', default: '' },
      { key: 'instagramUrl', label: 'Instagram URL', type: 'text', default: '' },
      { key: 'linkedinUrl', label: 'LinkedIn URL', type: 'text', default: '' },
    ],
  },

  /* ---------------- Booking Settings ---------------- */
  {
    section: 'Booking Settings',
    group: 'Booking Rules',
    fields: [
      {
        key: 'minNoticeDays',
        label: 'Minimum Notice (days)',
        type: 'number',
        default: '3',
        help: 'How far ahead a client must book. Shown on the booking form.',
      },
      {
        key: 'maxBookingsPerDay',
        label: 'Max Bookings Per Day',
        type: 'number',
        default: '2',
        help: 'Used by the availability check to warn about busy dates.',
      },
      {
        key: 'bookingNotice',
        label: 'Booking Page Notice',
        type: 'textarea',
        default: 'Submitting this form sends a request — our team will confirm availability within 24 hours.',
      },
    ],
  },
  {
    section: 'Booking Settings',
    group: 'Confirmation',
    fields: [
      {
        key: 'confirmationMode',
        label: 'Booking Confirmation Mode',
        type: 'select',
        options: [
          { value: 'manual', label: 'Require admin approval' },
          { value: 'auto', label: 'Automatically confirm' },
        ],
        default: 'manual',
        help: 'Manual keeps new bookings as Pending until you approve them. Automatic marks them Confirmed on submission.',
      },
    ],
  },
  {
    section: 'Booking Settings',
    group: 'Cancellation & Deposit',
    fields: [
      {
        key: 'cancellationAllowed',
        label: 'Allow Client Cancellations',
        type: 'toggle',
        default: 'true',
        help: 'When off, clients must contact you directly to cancel.',
      },
      {
        key: 'cancellationDeadlineHours',
        label: 'Cancellation Deadline (hours before event)',
        type: 'number',
        default: '48',
        showIf: { key: 'cancellationAllowed', equals: 'true' },
        help: 'Cancellations are refused inside this window.',
      },
      {
        key: 'cancellationPolicy',
        label: 'Cancellation Policy',
        type: 'textarea',
        default:
          'Bookings may be cancelled free of charge up to 48 hours before the event date. Inside that window the deposit is non-refundable.',
        showIf: { key: 'cancellationAllowed', equals: 'true' },
        help: 'Shown on the booking form and in confirmation emails.',
      },
      {
        key: 'depositRequired',
        label: 'Require a Deposit',
        type: 'toggle',
        default: 'false',
        help: 'Turn on to show the deposit terms when a client books.',
      },
      {
        key: 'depositType',
        label: 'Deposit Type',
        type: 'select',
        options: [
          { value: 'percent', label: 'Percentage of the total' },
          { value: 'fixed', label: 'Fixed amount' },
        ],
        default: 'percent',
        showIf: { key: 'depositRequired', equals: 'true' },
      },
      {
        key: 'depositValue',
        label: 'Deposit Amount',
        type: 'number',
        default: '25',
        showIf: { key: 'depositRequired', equals: 'true' },
        help: 'A percentage (0–100) or a flat amount in your default currency.',
      },
    ],
  },

  /* ---------------- Notifications ---------------- */
  {
    section: 'Notifications',
    group: 'Notification Preferences',
    // Which events raise a notification at all. The history panel below only
    // ever shows event types that are switched on here.
    fields: [
      { key: 'notifyNewBooking', label: 'New Booking', type: 'toggle', default: 'true' },
      { key: 'notifyNewInquiry', label: 'New Inquiry', type: 'toggle', default: 'true' },
      { key: 'notifyBookingCancellation', label: 'Booking Cancellation', type: 'toggle', default: 'true' },
      { key: 'notifyBookingConfirmation', label: 'Booking Confirmation', type: 'toggle', default: 'true' },
      { key: 'notifyNewClient', label: 'New Client Registration', type: 'toggle', default: 'false' },
      {
        key: 'notifyByEmail',
        label: 'Email Notifications',
        type: 'toggle',
        default: 'false',
        help: 'Also send the above to your contact email address.',
      },
    ],
  },
];

// Flat { key: defaultValue } map, handy for merging.
export const SETTING_DEFAULTS = Object.fromEntries(
  SETTINGS_SCHEMA.flatMap((g) => g.fields.map((f) => [f.key, f.default]))
);

export const SETTING_KEYS = Object.keys(SETTING_DEFAULTS);

// Every field, keyed — used to validate incoming values on save.
const FIELD_BY_KEY = Object.fromEntries(
  SETTINGS_SCHEMA.flatMap((g) => g.fields.map((f) => [f.key, f]))
);

// Settings are stored as strings, so anything reading a toggle should go
// through this rather than testing truthiness ('false' is a truthy string).
export function settingIsOn(value) {
  return value === true || value === 'true';
}

export function currencySymbol(settings) {
  return CURRENCY_SYMBOLS[settings?.currency] || settings?.currency || 'Rs';
}

// Coerces one incoming value into something safe for its field type: toggles
// become 'true'/'false', selects fall back to their default when given an
// option that doesn't exist, and numbers can't go negative.
function normalise(key, raw) {
  const field = FIELD_BY_KEY[key];
  if (!field) return null;

  if (field.type === 'toggle') {
    return settingIsOn(raw) ? 'true' : 'false';
  }

  if (field.type === 'select') {
    const allowed = (field.options || []).map((o) => o.value);
    return allowed.includes(String(raw)) ? String(raw) : field.default;
  }

  if (field.type === 'number') {
    const n = Number.parseFloat(raw);
    if (!Number.isFinite(n) || n < 0) return field.default;
    return String(n);
  }

  return String(raw ?? '');
}

// Reads every setting, merged over the defaults so callers always get a
// complete object. Never throws — if the Setting table doesn't exist yet
// (schema not pushed), the defaults are returned instead of breaking the
// public site.
export async function getSettings() {
  try {
    const rows = await prisma.setting.findMany();
    const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...SETTING_DEFAULTS, ...stored };
  } catch {
    return { ...SETTING_DEFAULTS };
  }
}

// Writes the given key/value pairs, ignoring any key that isn't in the schema
// so a crafted request can't stuff arbitrary rows into the table.
export async function saveSettings(values) {
  const entries = Object.entries(values)
    .filter(([key]) => SETTING_KEYS.includes(key))
    .map(([key, value]) => [key, normalise(key, value)]);

  await Promise.all(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );

  return getSettings();
}
