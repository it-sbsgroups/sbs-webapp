import { NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

/**
 * Runs on the Edge runtime BEFORE pages render.
 * Handles admin security boundaries and forces the root path (/) to serve /home.
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. FORCED HOME PAGE REWRITE
  // If the user visits the absolute root '/', force Next.js to render the /home route
  if (pathname === '/') {
    return NextResponse.rewrite(new URL('/home', request.url));
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname.startsWith("/login");

  // Not logged in and trying to reach the admin panel -> bounce to /login
  if (isAdminRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in and trying to view the login page -> send to dashboard
  if (isLoginRoute && session) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Added "/" to the matcher array so the middleware catches the homepage
  matcher: ["/", "/admin/:path*", "/login"],
};