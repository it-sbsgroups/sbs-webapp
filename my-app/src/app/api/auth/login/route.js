import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // 1) Ask NestJS to validate credentials against the database
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const { user } = await res.json();

    // 2) Create the session token (identity claims only — never the password)
    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      designation: user.designation,
    });

    // 3) Set the httpOnly session cookie  ← THIS is what was missing
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });

    // Return the token too: the browser stores it in localStorage('sbs_auth_token')
    // and sends it as `Authorization: Bearer` on direct calls to the NestJS API.
    // (The httpOnly cookie above stays for SSR/middleware gating.)
    return NextResponse.json({ user, token });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}