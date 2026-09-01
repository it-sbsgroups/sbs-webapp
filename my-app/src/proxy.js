import { NextResponse } from "next/server";
import {
  verifySessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

/**
 * Next.js 16 renamed `middleware.js` -> `proxy.js` (same behavior, new file
 * name/export). The old `middleware.js` convention is deprecated in v16 and
 * the docs no longer guarantee it runs the same way, so this file replaces
 * it — same logic, just renamed per the official migration.
 *
 * Handles:
 * - Redirecting / to /home
 * - Protecting /admin routes
 * - Redirecting authenticated users away from /login
 */
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // -------------------------------------------------------
  // 1. ROOT -> HOME
  // -------------------------------------------------------
  if (pathname === "/") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/home";
    homeUrl.search = "";

    return NextResponse.redirect(homeUrl);
  }

  // -------------------------------------------------------
  // 2. SESSION
  // -------------------------------------------------------
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  // -------------------------------------------------------
  // 3. ADMIN SECURITY
  // -------------------------------------------------------
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname.startsWith("/login");

  // Not logged in -> login
  if (isAdminRoute && !session) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // Already logged in -> dashboard
  if (isLoginRoute && session) {
    const dashboardUrl = request.nextUrl.clone();

    dashboardUrl.pathname = "/admin/dashboard";
    dashboardUrl.search = "";

    return NextResponse.redirect(dashboardUrl);
  }

  // -------------------------------------------------------
  // 4. NORMAL REQUEST
  // -------------------------------------------------------
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/login",
  ],
};
