import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";

// Name of the httpOnly cookie that holds the admin session token.
export const ADMIN_SESSION_COOKIE = "cc_admin_session";

// How long an admin session stays valid before requiring login again.
const SESSION_DURATION = "8h";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function secretKey() {
  const secret = process.env.JWT_SECRET || "dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

// Issues a signed session token for a logged-in admin. Only non-sensitive
// fields (id, email) go in the payload — never the password hash.
export async function createAdminSessionToken({ id, email }) {
  return new SignJWT({ sub: String(id), email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(secretKey());
}

// Verifies a session token. Returns the decoded payload ({ sub, email, ... })
// on success, or null if the token is missing, expired, or invalid.
export async function verifyAdminSessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload;
  } catch {
    return null;
  }
}

// ---------- Forgot / reset password ----------
// How long a password reset link stays valid.
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Generates a random reset token. The raw token is emailed/shown to the
// admin and never stored — only its SHA-256 hash is saved, the same way a
// password hash is, so a leaked database can't be used to reset accounts.
export function generateResetToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  return { rawToken, tokenHash, expiresAt };
}

export function hashResetToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export const ADMIN_SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
