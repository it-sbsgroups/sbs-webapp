// app/not-found.js
//
// Next.js App Router convention: a file literally named `not-found.js`
// placed directly under `src/app/` is picked up AUTOMATICALLY — no route
// registration, no import anywhere needed. Next.js renders it whenever:
//   1. A URL doesn't match any page in the whole app (e.g. a typo'd link,
//      an old bookmarked URL, a bot probing random paths), or
//   2. Any Server Component in the app calls `notFound()` from
//      `next/navigation` (e.g. "product with this SKU doesn't exist").
//
// This is a plain Server Component (no "use client" needed) since it has
// no interactivity beyond plain <Link>s.

import Link from "next/link";
import { Search, Home, PackageSearch } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal standalone header — this page renders outside the normal
          (public) route group layout, so it doesn't inherit the site's
          usual <Header/>. Kept intentionally light so it never depends on
          data-fetching that could itself fail. */}
      <header className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <Link href="/" className="text-lg font-black tracking-tight text-blue-950">
            SBS <span className="text-[#557b00]">Groups</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-xl w-full text-center space-y-8">
          {/* Big 404 */}
          <div className="relative inline-block">
            <h1 className="text-[120px] md:text-[160px] font-black leading-none text-slate-100 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex items-center justify-center h-16 w-16 rounded-2xl bg-[#557b00] text-white shadow-lg">
                <PackageSearch className="h-8 w-8" strokeWidth={2.2} />
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-blue-950">
              Page Not Found
            </h2>
            <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-md mx-auto">
              The page you're looking for doesn't exist, may have been moved, or the
              link you followed is out of date.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-blue-950 text-white font-black text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider shadow-md hover:bg-blue-900 transition-colors"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-950 border-2 border-blue-950 font-black text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider hover:bg-blue-50 transition-colors"
            >
              <Search className="h-4 w-4" />
              Browse Products
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
