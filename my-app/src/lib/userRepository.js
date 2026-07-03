import { USER } from "@/data/users";

/**
 * This file is the ONLY place that should know "where users live".
 *
 * Right now that's the dummy `USER` array in `data/users.js`. When the
 * NestJS API is ready, change the bodies of these two functions to call your
 * API instead (e.g. `fetch(`${process.env.API_BASE_URL}/admin-users/...`)`).
 * Nothing else in the app (login route, /api/auth/me, middleware,
 * AuthContext) needs to change.
 */

/** Finds a user by email (case-insensitive). Returns the FULL record, including the hashed password — only use this server-side. */
export function findUserByEmail(email) {
  if (!email) return null;
  const normalized = String(email).trim().toLowerCase();
  return USER.find((u) => u.email.toLowerCase() === normalized) || null;
}

/** Finds a user by id. Returns the FULL record — only use this server-side. */
export function findUserById(id) {
  if (!id) return null;
  return USER.find((u) => u.id === id) || null;
}

/**
 * Strips sensitive fields (password) before sending a user object to the
 * browser. ALWAYS pass user objects through this before returning them from
 * an API route.
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}
