"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  // useSearchParams() needs a Suspense boundary around it in the App Router
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState("login"); // 'login' | 'forgot'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data?.error || "Unable to login. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Persist the token for direct API calls to the NestJS backend.
      // apiClient reads this and sends it as `Authorization: Bearer`.
      if (data?.token && typeof window !== "undefined") {
        localStorage.setItem("sbs_auth_token", data.token);
      }

      const redirectTo = searchParams.get("redirect") || "/admin/dashboard";
      router.push(redirectTo);
      router.refresh();
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-blue-950 via-blue-900 to-gray-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">

      {/* CARD BODY WRAPPER */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300">

        {/* BRAND IDENTITY TOP BLOCK HEADER WITH LOGO IMAGE */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-950 px-6 py-8 text-center border-b border-gray-100 flex flex-col items-center justify-center">
          <Link href="/" className="inline-block">
            <img
              src="/logos/logo.png"
              alt="SBS Groups Official Corporate Logo"
              className="h-14 w-auto object-contain max-w-[220px]"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="hidden text-2xl font-black text-white tracking-tight">
              SBS <span className="text-lime-400">GROUPS</span>
            </span>
          </Link>
          <span className="text-[10px] font-bold tracking-widest text-blue-200/60 uppercase mt-3">
            Secure Authorized Partner Portal
          </span>
        </div>

        {/* --- LIVE INTERACTION CONTENT AREA --- */}
        <div className="p-6 sm:p-8">

          {/* ERROR ALERT BOX */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-[11px] font-bold text-red-600 text-center">
              {errorMsg}
            </div>
          )}

          {/* STATE 1: CREDENTIALS INPUT SCREEN */}
          {currentStep === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Admin Login</h2>
                <p className="text-xs text-gray-500">Sign in to manage sbsgroups.co.in</p>
              </div>

              <div className="space-y-4 pt-2">
                {/* Input 1: Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block">Email</label>
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sbsgroups.co.in"
                    className="w-full px-3 py-2.5 rounded border border-gray-300 bg-gray-50 text-xs text-gray-800 focus:outline-none focus:border-blue-900 focus:bg-white"
                  />
                </div>

                {/* Input 2: Password */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Password</label>
                    <button
                      type="button"
                      onClick={() => { setCurrentStep("forgot"); setErrorMsg(""); }}
                      className="text-[11px] font-bold text-red-600 hover:underline hover:text-blue-900 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="SbsAdmin@2026"
                      className="w-full px-3 py-2.5 pr-16 rounded border border-gray-300 bg-gray-50 text-xs text-gray-800 focus:outline-none focus:border-blue-900 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 hover:text-blue-900 uppercase"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 text-white font-bold text-xs py-3 px-4 rounded transition-colors uppercase tracking-wider mt-2 shadow-sm"
              >
                {isSubmitting ? "Signing in..." : "Sign In →"}
              </button>
            </form>
          )}

          {/* STATE 2: FORGOT PASSWORD INFO SCREEN */}
          {currentStep === "forgot" && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Reset Password</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Self-service password reset (via OTP email/SMS) isn&apos;t available yet.
                  Please contact the system administrator directly to have your password reset.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep("login")}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2.5 px-4 rounded transition-colors uppercase tracking-wider"
              >
                ← Back to login
              </button>
            </div>
          )}

        </div>

        {/* BOTTOM METRIC DISCLAIMER */}
        <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-100 text-[10px] text-gray-400">
          <p>© 2026 SBS Group. Restricted Access. System sessions are monitored for compliance tracking.</p>
        </div>

      </div>
    </main>
  );
}
