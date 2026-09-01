import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/apiConfig";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const res = await fetch(`${getApiBaseUrl()}/auth/profile`, {
    headers: { Cookie: `${SESSION_COOKIE_NAME}=${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await res.json();
  return NextResponse.json({ user });
}