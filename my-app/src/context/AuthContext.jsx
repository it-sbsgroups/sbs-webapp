"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

/**
 * Provides the currently logged-in admin user (fetched from /api/auth/me)
 * and a `logout()` helper to every client component inside /admin.
 *
 * NOTE: This is for DISPLAY purposes (showing the name, avatar, etc.) and
 * for triggering logout. It is NOT the security boundary — `middleware.js`
 * is what actually blocks unauthenticated access to /admin/*.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      // /session/me, not /api/auth/me — see note in login/page.js about the
      // /api/ nginx collision with the NestJS backend.
      const res = await fetch("/session/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      // /session/logout, not /api/auth/logout — same /api/ collision.
      await fetch("/session/logout", { method: "POST" });
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("sbs_auth_token");
        sessionStorage.removeItem("sbs_site_config_otp_id");
      }
      setUser(null);
      router.push("/login");
      router.refresh();
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
