import { SignJWT, jwtVerify } from "jose";

/**
 * Central place for everything related to the admin session token.
 *
 * Uses `jose` because it works in BOTH the Node runtime (API routes) and the
 * Edge runtime (middleware) — unlike `jsonwebtoken`, which only works in Node.
 *
 * 🔁 FUTURE MIGRATION NOTE (NestJS):
 * When the NestJS API is ready, you have two options:
 *  1) Keep this exactly as-is. NestJS just becomes the place that validates
 *     email/password (see lib/userRepository.js) — Next.js still issues and
 *     verifies its own short-lived session cookie. No changes needed here.
 *  2) Or, if NestJS issues its own JWTs, change `createSessionToken` to wrap
 *     the NestJS-issued token instead, and use the SAME secret on both sides
 *     so `verifySessionToken` keeps working unchanged.
 */

const SESSION_SECRET =
  process.env.JWT_SECRET || "dev-only-insecure-secret-change-me";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  // Loud warning instead of a hard crash, so `next build` never fails because
  // of a missing env var — but you MUST set this before going live.
  console.warn(
    "⚠️  JWT_SECRET is not set. Using an insecure default. " +
      "Set JWT_SECRET in your environment before deploying to production."
  );
}

const encodedSecret = new TextEncoder().encode(SESSION_SECRET);

export const SESSION_COOKIE_NAME = "sbs_admin_session";

// 8 hours — short enough to limit damage if a cookie leaks, long enough that
// an admin doesn't get logged out mid-task.
export const SESSION_DURATION_SECONDS = 60 * 60 * 8;

/**
 * Signs a session JWT containing only non-sensitive identity claims.
 * NEVER put the password (hashed or not) in here.
 */
export async function createSessionToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(encodedSecret);
}

/**
 * Verifies a session JWT. Returns the decoded payload, or `null` if the
 * token is missing, malformed, expired, or has an invalid signature.
 */
export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload;
  } catch {
    return null;
  }
}
