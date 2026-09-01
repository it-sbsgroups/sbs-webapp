"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import testimonialsApi from "@/lib/testimonialsApi";

/* ------------------------------------------------------------------ */
/*  Shell – moved outside to prevent unmounting on every render      */
/* ------------------------------------------------------------------ */
function Shell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Local‑storage helpers                                             */
/* ------------------------------------------------------------------ */
const getDraftKey = (code) => `testimonial_draft_${code}`;

function saveDraft(code, data, cursor) {
  try {
    const payload = { ...data };
    if (cursor) payload.__cursor = cursor;
    localStorage.setItem(getDraftKey(code), JSON.stringify(payload));
  } catch (_) {}
}

function loadDraft(code) {
  try {
    const raw = localStorage.getItem(getDraftKey(code));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function clearDraft(code) {
  localStorage.removeItem(getDraftKey(code));
}

/* ------------------------------------------------------------------ */
/*  The actual form content                                           */
/* ------------------------------------------------------------------ */
function TestimonialFormContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || searchParams.get("token") || "";

  // Refs for focusing after restore
  const nameRef = useRef(null);
  const designationRef = useRef(null);
  const emailRef = useRef(null);
  const testimonyRef = useRef(null);

  // Map field names to refs
  const refMap = {
    name: nameRef,
    designation: designationRef,
    email: emailRef,
    testimony: testimonyRef,
  };

  const [phase, setPhase] = useState("checking"); // checking | valid | invalid | submitted
  const [error, setError] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [testimony, setTestimony] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ----------------- Validate the passcode -----------------
  useEffect(() => {
    if (!code) {
      setPhase("invalid");
      setError("No passcode found in this link.");
      return;
    }
    let alive = true;
    (async () => {
      try {
        const res = await testimonialsApi.verify(code);
        if (!alive) return;
        if (res?.valid) {
          setCompanyName(res.companyName || "");
          setPhase("valid");
        } else {
          setPhase("invalid");
          setError("This link is invalid or has expired.");
        }
      } catch (e) {
        if (!alive) return;
        setPhase("invalid");
        setError(e.message || "This link is invalid or has already been used.");
      }
    })();
    return () => {
      alive = false;
    };
  }, [code]);

  // ----------------- Load draft when the link is valid -----------------
  useEffect(() => {
    if (phase !== "valid" || !code) return;

    const draft = loadDraft(code);
    if (!draft) return;

    // Restore text values (omit the __cursor key)
    if (draft.name !== undefined) setName(draft.name);
    if (draft.designation !== undefined) setDesignation(draft.designation);
    if (draft.email !== undefined) setEmail(draft.email);
    if (draft.testimony !== undefined) setTestimony(draft.testimony);

    // Restore cursor position after the next render
    if (draft.__cursor) {
      const { field, start, end } = draft.__cursor;
      requestAnimationFrame(() => {
        const el = refMap[field]?.current;
        if (el) {
          el.focus();
          if (typeof start === "number" && typeof end === "number") {
            el.setSelectionRange(start, end);
          } else {
            // fallback: put cursor at the end
            const len = el.value.length;
            el.setSelectionRange(len, len);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, code]);

  // ----------------- Auto‑save on every value change -----------------
  useEffect(() => {
    if (phase !== "valid" || !code) return;
    saveDraft(code, { name, designation, email, testimony });
    // Note: cursor is saved inside each change handler because
    // this effect runs *after* render and we may have lost the exact selection.
  }, [name, designation, email, testimony, phase, code]);

  // ----------------- Save cursor position on every input interaction -----------------
  const saveCursor = (field) => {
    const el = refMap[field]?.current;
    if (!el) return;
    saveDraft(code, { name, designation, email, testimony }, {
      field,
      start: el.selectionStart,
      end: el.selectionEnd,
    });
  };

  // Wrapper handlers that also store cursor
  const handleNameChange = (e) => {
    setName(e.target.value);
    saveCursor("name");
  };
  const handleDesignationChange = (e) => {
    setDesignation(e.target.value);
    saveCursor("designation");
  };
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    saveCursor("email");
  };
  const handleTestimonyChange = (e) => {
    setTestimony(e.target.value);
    saveCursor("testimony");
  };

  // ----------------- Submit -----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (testimony.trim().length < 10) {
      setError("Please write at least a sentence or two.");
      return;
    }
    setSubmitting(true);
    try {
      await testimonialsApi.submit({
        code,
        name: name.trim(),
        designation: designation.trim() || undefined,
        email: email.trim() || undefined,
        testimony: testimony.trim(),
      });
      clearDraft(code);
      setPhase("submitted");
    } catch (e) {
      setError(e.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------- Renders -----------------
  if (phase === "checking") {
    return (
      <Shell>
        <div className="text-center space-y-3 py-8">
          <div className="h-10 w-10 mx-auto animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-slate-500">Verifying your link…</p>
        </div>
      </Shell>
    );
  }

  if (phase === "invalid") {
    return (
      <Shell>
        <div className="text-center space-y-3 py-6">
          <div className="text-4xl">⛔</div>
          <h1 className="text-xl font-bold text-slate-900">Link not valid</h1>
          <p className="text-slate-500 text-sm">{error}</p>
          <p className="text-slate-400 text-xs">
            Please ask your contact at SBS Groups for a fresh link.
          </p>
        </div>
      </Shell>
    );
  }

  if (phase === "submitted") {
    return (
      <Shell>
        <div className="text-center space-y-3 py-6">
          <div className="text-4xl">✅</div>
          <h1 className="text-xl font-bold text-slate-900">Thank you!</h1>
          <p className="text-slate-500 text-sm">
            Your testimonial has been submitted and will appear once our team
            approves it.
          </p>
        </div>
      </Shell>
    );
  }

  // phase === "valid"
  return (
    <Shell>
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-black text-slate-900">
          Share your experience
        </h1>
        <p className="text-slate-500 text-sm">
          On behalf of{" "}
          <span className="font-semibold text-slate-700">{companyName}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
            Your Name *
          </label>
          <input
            type="text"
            ref={nameRef}
            value={name}
            onChange={handleNameChange}
            required
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
            Designation
          </label>
          <input
            type="text"
            ref={designationRef}
            value={designation}
            onChange={handleDesignationChange}
            placeholder="e.g., Procurement Manager"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
            Email (optional)
          </label>
          <input
            type="email"
            ref={emailRef}
            value={email}
            onChange={handleEmailChange}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
            Your Testimonial *
          </label>
          <textarea
            rows="5"
            ref={testimonyRef}
            value={testimony}
            onChange={handleTestimonyChange}
            required
            placeholder="Tell us about your experience working with SBS Groups…"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit Testimonial"}
        </button>
      </form>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/*  Page wrapper with Suspense                                        */
/* ------------------------------------------------------------------ */
export default function WriteTestimonialPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400">
          Loading…
        </div>
      }
    >
      <TestimonialFormContent />
    </Suspense>
  );
}