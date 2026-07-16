"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Handshake, MessageSquareText, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  // useSearchParams() needs a Suspense boundary
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ---------- STATE ----------
  const [currentStep, setCurrentStep] = useState("login"); // 'login' | 'forgot'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab state – default "admin"
  const [activeTab, setActiveTab] = useState("admin");

  // ---------- LOGIN HANDLER ----------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data?.error || "Unable to login. Please try again.");
        setIsSubmitting(false);
        return;
      }

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

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen bg-[#ececec] flex items-center justify-center p-6">
      <div className="relative overflow-hidden w-full max-w-6xl rounded-[28px] bg-white shadow-2xl">
        <div className="absolute right-0 top-0 h-full w-[45%] hidden lg:block">
          <div
            className="absolute inset-0"
            style={{
              clipPath:
                "polygon(25% 0%,100% 0%,100% 100%,25% 100%,0% 75%,0% 45%)",
              background: "#ff5c2d",
            }}
          />
          <div
            className="absolute left-[-110px] top-[70px] h-[550px] w-[170px] rotate-45 rounded-full opacity-30"
            style={{ background: "#ff8b67" }}
          />
        </div>

        <div className="relative grid lg:grid-cols-2 gap-10 items-center p-8 lg:p-20">
          <div className="max-w-md mx-auto w-full">
            <div className="flex justify-center mb-10">
              <Image src="https://res.cloudinary.com/dhrnoojwo/image/upload/v1783925400/sbs-media/branding/founder/boxudtpue61v4stxs92f.png" alt="SBS Groups" width={230} height={70} priority onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }} />
              <span className="hidden text-2xl font-black text-blue-950">
                SBS <span className="text-lime-500">Groups</span>
              </span>
            </div>

            {/* Error alert */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
                {errorMsg}
              </div>
            )}

            {/* Login or Forgot Password form */}
            {currentStep === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full h-12 rounded-xl border border-black text-black px-5 outline-none focus:border-orange-500 transition" required />

                <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-12 rounded-xl border border-black text-black px-5 outline-none focus:border-orange-500 transition" required />

                <div className="flex justify-between items-center text-sm">
                  <label className="flex items-center gap-2 cursor-pointer text-black">
                    <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} />
                    Show Password
                  </label>
                  <button type="button" onClick={() => { setCurrentStep("forgot"); setErrorMsg(""); }} className="text-blue-600 hover:underline" >
                    Forgot Password?
                  </button>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold shadow-lg transition duration-300" >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>
              </form>
            )}

            {currentStep === "forgot" && (
              <div className="space-y-5">
                <div className="text-center">
                  <h2 className="text-lg font-bold text-gray-800">Reset Password</h2>
                  <p className="text-sm text-gray-500 leading-relaxed mt-2">
                    Self‑service password reset isn&apos;t available yet.
                    <br />
                    Please contact the system administrator directly.
                  </p>
                </div>
                <button type="button" onClick={() => setCurrentStep("login")} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm py-2.5 rounded-xl transition-colors" >
                  ← Back to login
                </button>
              </div>
            )}
          </div>

          {/* ---------- RIGHT SIDE: SUPPORT CARD ---------- */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-sm relative">
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-4xl">
                  <Handshake size={60} />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-center text-gray-800" autoCapitalize="">Having Issue? Need Support</h3>
              <p className="text-center text-gray-600 mt-6 leading-8">ALways Available For You: 24/7</p>
              <div className="mt-10 space-y-5">
                <div className="flex items-center justify-center gap-3 text-gray-700">
                  <span className="text-2xl"><Phone /></span>
                  <span className="font-medium">+91 9512360091</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-green-600 font-semibold">
                  <span className="text-2xl"><MessageSquareText /></span>
                  Click to WhatsApp
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}