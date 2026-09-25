import nodemailer from "nodemailer";

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Gmail email settings are not configured.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function formatEventDate(eventDate) {
  const d = new Date(eventDate);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Sent once, right after a client submits a booking, so they have the
// reference saved in their inbox instead of having to remember it.
export async function sendBookingReceivedEmail({ to, bookingRef, eventType, eventDate }) {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.GMAIL_USER;
  const formattedDate = formatEventDate(eventDate);

  await transporter.sendMail({
    from: `Creative Corner <${from}>`,
    to,
    subject: "Creative Corner – Booking Received",
    text: [
      "Your booking request has been received.",
      "",
      `Booking Reference ID: ${bookingRef}`,
      `Event: ${eventType}`,
      `Date: ${formattedDate}`,
      "Status: Pending",
      "",
      "You can use this email to keep track of your booking.",
      "",
      "Creative Corner",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#292333;max-width:600px;margin:auto;padding:24px">
        <h2 style="margin-bottom:8px">Creative Corner</h2>
        <p>Your booking request has been received.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr>
            <td style="padding:6px 0;color:#666">Booking Reference ID</td>
            <td style="padding:6px 0;font-weight:bold">${bookingRef}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#666">Event</td>
            <td style="padding:6px 0">${eventType}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#666">Date</td>
            <td style="padding:6px 0">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#666">Status</td>
            <td style="padding:6px 0">
              <span style="display:inline-block;padding:2px 10px;border-radius:12px;background:#fff3cd;color:#8a6d00;font-size:13px">Pending</span>
            </td>
          </tr>
        </table>
        <p style="color:#666">You can use this email to keep track of your booking.</p>
      </div>
    `,
  });
}

// Sent whenever the admin approves (status -> Confirmed) or rejects
// (status -> Cancelled) a booking, so the client is notified without having
// to check the site.
export async function sendBookingStatusEmail({ to, bookingRef, status }) {
  const isApproved = status === "Confirmed";
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.GMAIL_USER;

  const subject = isApproved
    ? "Creative Corner – Booking Approved"
    : "Creative Corner – Booking Update";
  const message = isApproved
    ? `Your Creative Corner booking ${bookingRef} has been approved.`
    : `Your Creative Corner booking ${bookingRef} was not approved.`;
  const badgeColor = isApproved ? "#d1e7dd" : "#f8d7da";
  const badgeText = isApproved ? "#0f5132" : "#842029";
  const badgeLabel = isApproved ? "Approved" : "Not Approved";

  await transporter.sendMail({
    from: `Creative Corner <${from}>`,
    to,
    subject,
    text: [message, "", "Creative Corner"].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#292333;max-width:600px;margin:auto;padding:24px">
        <h2 style="margin-bottom:8px">Creative Corner</h2>
        <p>${message}</p>
        <p>
          <span style="display:inline-block;padding:4px 14px;border-radius:12px;background:${badgeColor};color:${badgeText};font-size:13px">${badgeLabel}</span>
        </p>
        <p style="color:#666">Booking Reference ID: ${bookingRef}</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail({ to, resetUrl }) {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.GMAIL_USER;

  await transporter.sendMail({
    from: `Creative Corner <${from}>`,
    to,
    subject: "Creative Corner Admin Password Reset",
    text: [
      "Hello,",
      "",
      "We received a request to reset your Creative Corner admin password.",
      `Use this link to choose a new password: ${resetUrl}`,
      "",
      "This link will expire in 30 minutes.",
      "If you did not request this, you can safely ignore this email.",
      "",
      "Creative Corner",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#292333;max-width:600px;margin:auto;padding:24px">
        <h2 style="margin-bottom:8px">Creative Corner</h2>
        <p>We received a request to reset your admin password.</p>
        <p>Click the button below to choose a new password.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#7C5CFC;color:#fff;text-decoration:none;border-radius:8px">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 30 minutes.</p>
        <p style="color:#666">If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
