"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";

// Gates access to Site Configuration behind a one-time code emailed to the
// logged-in admin's own account address. Verifying stores a short-lived
// session id (sessionStorage) that the OTP-token-aware save calls in
// siteConfigApi attach as the `x-otp-token` header — the backend
// SiteConfigOtpGuard checks that token server-side on every PUT.
export default function SiteConfigOtpGate({ children }) {
  const [checking, setChecking] = useState(true);
  const [verified, setVerified] = useState(false);
  const [otpId, setOtpId] = useState(null);
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);

  useEffect(() => {
    setVerified(siteConfigApi.otp.isVerified());
    setChecking(false);
  }, []);

  const sendCode = async () => {
    setSending(true);
    try {
      const res = await siteConfigApi.otp.request();
      setOtpId(res.otpId);
      setExpiresAt(res.expiresAt);
      toast.success("Verification code sent to your admin email");
    } catch (e) {
      toast.error(e.message || "Failed to send verification code");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!verified && !checking) sendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking]);

  const verify = async (e) => {
    e.preventDefault();
    if (!otpId || code.trim().length !== 6) return;
    setVerifying(true);
    try {
      await siteConfigApi.otp.verify(otpId, code.trim());
      setVerified(true);
      toast.success("Verified — welcome to Site Configuration");
    } catch (e) {
      toast.error(e.message || "Invalid code");
    } finally {
      setVerifying(false);
    }
  };

  if (checking) return null;
  if (verified) return children;

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900">Verify it&apos;s you</h1>
            <p className="text-xs text-slate-500 font-medium">Site Configuration is OTP-protected</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed flex items-start gap-2">
          <Mail size={14} className="mt-0.5 shrink-0" />
          A 6-digit code was sent to your admin account email
          {expiresAt ? ` — it expires in a few minutes.` : "."}
        </p>

        <form onSubmit={verify} className="space-y-3">
          <input
            autoFocus
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full text-center tracking-[0.5em] text-xl font-black px-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
          <button
            type="submit"
            disabled={verifying || code.length !== 6}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-950 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900 disabled:opacity-50"
          >
            {verifying ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {verifying ? "Verifying…" : "Verify & Continue"}
          </button>
        </form>

        <button
          onClick={sendCode}
          disabled={sending}
          className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          {sending ? "Sending…" : "Resend code"}
        </button>
      </div>
    </div>
  );
}
