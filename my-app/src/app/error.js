// app/error.js
//
// Next.js App Router convention: a file literally named `error.js` placed
// directly under `src/app/` is picked up AUTOMATICALLY as an error
// boundary — no route registration, no import anywhere needed. Next.js
// renders it whenever a Server or Client Component **beneath the root
// layout** throws during render.
//
// Requirements enforced by Next.js:
//   - MUST be a Client Component ("use client" below) — error boundaries
//     use React state internally, which requires the client runtime.
//   - MUST accept `error` and `reset` props. `error` is the thrown Error
//     (in production, Next.js redacts the original message for errors
//     thrown in Server Components and replaces it with a generic one,
//     but still gives you `error.digest` — a short code you can grep your
//     server logs for). `reset()` re-renders the segment that crashed,
//     without a full page reload.
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Swap this for your real error-tracking call (Sentry, LogRocket, a
    // custom /api/log-error endpoint, etc.) — for now it just makes sure
    // the failure is visible in the browser console / server logs.
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <Link href="/" className="text-lg font-black tracking-tight text-blue-950">
            SBS <span className="text-[#557b00]">Groups</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-xl w-full text-center space-y-8">
          <div className="flex justify-center">
            <span className="flex items-center justify-center h-20 w-20 rounded-2xl bg-red-50 text-red-600 shadow-inner">
              <AlertTriangle className="h-10 w-10" strokeWidth={2} />
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-blue-950">
              Something Went Wrong
            </h1>
            <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-md mx-auto">
              An unexpected error stopped this page from loading. You can try again, or
              head back to the homepage.
            </p>
          </div>

          {/* The error name/message — shows the real message in dev; in
              production Next.js redacts Server Component error text and
              you'll see a generic message plus a digest code instead. */}
          {(error?.message || error?.digest) && (
            <div className="text-left bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mx-auto max-w-md">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                Error Details
              </p>
              {error?.message && (
                <p className="text-xs font-mono text-slate-700 break-words">{error.message}</p>
              )}
              {error?.digest && (
                <p className="text-[10px] font-mono text-slate-400 mt-1">Ref: {error.digest}</p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 bg-blue-950 text-white font-black text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider shadow-md hover:bg-blue-900 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-950 border-2 border-blue-950 font-black text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider hover:bg-blue-50 transition-colors"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
