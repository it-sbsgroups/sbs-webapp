// components/public/Header.jsx (UPDATED VERSION)
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchGlobalSearch, flattenPreview, TYPE_META } from "@/lib/globalSearchApi";
import searchLogsApi from "@/lib/searchLogsApi";

// Import dummy data (replace with API call later)
import headerDummyData from "@/data/headerData";
import headerApi from "@/lib/headerApi";
import categoriesApi from "@/lib/categoriesApi";

export default function Header() {
  const router = useRouter();

  // ===== STATE =====
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);  // Products mega‑dropdown
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);  // Other Services dropdown
  const [openCategoryId, setOpenCategoryId] = useState(null);   // Subcategory flyout
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [resultCounts, setResultCounts] = useState({ products: 0, news: 0, brands: 0, total: 0 });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const searchBoxRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // ===== DYNAMIC DATA =====
  const [headerData, setHeaderData] = useState(headerDummyData);

  // ===== PRODUCTS DROPDOWN: live categories + subcategories =====
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await categoriesApi.getAll();
        if (active) setCategories(Array.isArray(data) ? data.filter((c) => c.isActive !== false) : []);
      } catch {
        if (active) setCategories([]);
      } finally {
        if (active) setCategoriesLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Fetch header config from backend
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cfg = await headerApi.get();
        if (active && cfg && Object.keys(cfg).length) {
          setHeaderData((prev) => ({ ...prev, ...cfg }));
        }
      } catch {
        /* keep defaults */
      }
    })();
    return () => { active = false; };
  }, []);

  // ===== SEARCH (live, debounced, hits the backend) =====
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setResults([]);
      setResultCounts({ products: 0, news: 0, brands: 0, total: 0 });
      setShowResults(false);
      setIsSearching(false);
      setActiveIdx(-1);
      return;
    }

    setShowResults(true);
    setIsSearching(true);
    const controller = new AbortController();
    const debounce = setTimeout(async () => {
      try {
        const res = await fetchGlobalSearch(q, { type: "all", signal: controller.signal });
        setResults(flattenPreview(res, 4));
        setResultCounts(res.counts || { products: 0, news: 0, brands: 0, total: 0 });
        setActiveIdx(-1);
        // Fire-and-forget: feeds the admin "Search Logs" dashboard.
        searchLogsApi.log(q, res.counts?.total ?? 0).catch(() => {});
      } catch (err) {
        if (err?.name !== "AbortError") setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // debounce so we don't hit the API on every keystroke

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [searchQuery]);

  useEffect(() => {
    const onClick = (e) => {
      const inDesktop = searchBoxRef.current?.contains(e.target);
      const inMobile = mobileSearchRef.current?.contains(e.target);
      if (!inDesktop && !inMobile) setShowResults(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // ===== HELPERS =====
  const goTo = (href) => {
    setShowResults(false);
    setSearchQuery("");
    setIsSearchOpen(false);
    setIsMenuOpen(false);
    router.push(href);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (activeIdx >= 0 && results[activeIdx]) goTo(results[activeIdx].href);
    else if (searchQuery.trim()) goTo(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleKeyDown = (e) => {
    if (!showResults || results.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => (i + 1) % results.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => (i <= 0 ? results.length - 1 : i - 1)); }
    else if (e.key === "Escape") setShowResults(false);
  };

  // ===== DYNAMIC DATA EXTRACTION =====
  const { branding, primaryNavigation, dropdownNavigation } = headerData;

  // Get visible primary nav items sorted by order
  const visiblePrimaryNav = primaryNavigation
    .filter(item => item.status)
    .sort((a, b) => a.order - b.order);

  // Mobile links: primary nav + every category + Other Services dropdown items (if exists)
  const allMobileLinks = [
    ...visiblePrimaryNav.map(item => ({ name: item.name, href: item.link })),
    ...categories.map((cat) => ({ name: cat.name, href: `/products?categoryId=${cat.id}` })),
    ...(dropdownNavigation?.hasDropdown && dropdownNavigation.dropdownItems
      ? dropdownNavigation.dropdownItems.filter(item => item.status !== false).map(item => ({ name: item.name, href: item.link }))
      : []),
  ];

  // ===== RENDER FUNCTIONS =====
  const ResultsDropdown = ({ idPrefix }) =>
    showResults ? (
      <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-gray-100 bg-white shadow-2xl z-[100] overflow-hidden">
        {isSearching && results.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs font-semibold text-gray-400">Searching…</div>
        ) : results.length > 0 ? (
          <>
            <ul className="max-h-[60vh] overflow-y-auto py-1">
              {results.map((r, i) => {
                const meta = TYPE_META[r.type] || {};
                return (
                  <li key={`${idPrefix}-${r.type}-${r.id}`}>
                    <button
                      onMouseEnter={() => setActiveIdx(i)}
                      onClick={() => goTo(r.href)}
                      className={`w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors ${i === activeIdx ? "bg-blue-50" : "hover:bg-gray-50"}`}
                    >
                      {r.image ? (
                        <img src={r.image} alt="" className="h-8 w-8 shrink-0 rounded-md object-contain bg-gray-50 border border-gray-100" />
                      ) : (
                        <span className={`shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${meta.color || "bg-gray-100 text-gray-600"}`}>
                          {meta.icon} {meta.label}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block text-xs font-black text-gray-900 truncate">{r.title}</span>
                        {r.subtitle && <span className="block text-[10px] font-semibold text-gray-400 truncate">{r.subtitle}</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button onClick={() => goTo(`/search?q=${encodeURIComponent(searchQuery.trim())}`)}
              className="w-full border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-blue-900 hover:bg-gray-100 transition-colors text-left">
              See all {resultCounts.total || ""} result{resultCounts.total === 1 ? "" : "s"} for &ldquo;{searchQuery.trim()}&rdquo; →
            </button>
          </>
        ) : (
          <div className="px-4 py-6 text-center text-xs font-semibold text-gray-400">No matches for &ldquo;{searchQuery.trim()}&rdquo;</div>
        )}
      </div>
    ) : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b-white/20 border-white-90 bg-white/70 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">

        {/* ===== DYNAMIC LOGO ===== */}
        <div className="flex shrink-0 items-center">
          <Link href="/" className="flex items-center gap-3 group focus:outline-none">
            {branding.logoUrl ? (
              <Image
                src={branding.logoUrl}
                alt={`${branding.companyName || "SBS Groups"} Logo`}
                width={160}
                height={56}
                priority
                className="h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div className={`flex-col ${branding.logoUrl ? "hidden" : "flex"}`}>
              <span className="text-lg font-black tracking-tighter text-blue-950 group-hover:text-blue-900 transition-colors">
                {branding.companyName}
              </span>
              <span className="text-[10px] font-bold text-lime-600 uppercase tracking-widest leading-none mt-0.5">
                {branding.tagline}
              </span>
            </div>
          </Link>
        </div>

        {/* ===== DESKTOP SEARCH ===== */}
        <div ref={searchBoxRef} className="hidden md:flex items-center flex-1 max-w-xs relative">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => searchQuery.trim().length >= 2 && setShowResults(true)}
              placeholder="Search products, news, brands..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-4 pr-10 py-2.5 text-xs font-medium text-gray-900 placeholder-gray-400 focus:border-blue-900 focus:bg-white focus:outline-none transition-all shadow-inner"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-900 transition-colors p-1" aria-label="Submit search">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
          <ResultsDropdown idPrefix="desktop" />
        </div>

        {/* ===== DYNAMIC DESKTOP NAV ===== */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {visiblePrimaryNav.map((navItem) => (
            <Link
              key={navItem.id}
              href={navItem.link}
              style={{
                color: navItem.fontColor,
                fontSize: `${navItem.fontSize}px`,
                fontWeight: navItem.fontWeight,
              }}
              className="rounded-lg px-3 py-2 uppercase tracking-wider hover:bg-gray-50 hover:text-blue-900 transition-all whitespace-nowrap"
              onMouseEnter={(e) => {
                e.target.style.color = navItem.hoverFontColor;
                e.target.style.backgroundColor = navItem.hoverBgColor;
              }}
              onMouseLeave={(e) => {
                e.target.style.color = navItem.fontColor;
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              {navItem.name}
            </Link>
          ))}

          {/* ===== PRODUCTS MEGA-DROPDOWN ===== */}
          {categories.length > 0 && (
            <div className="relative" onMouseEnter={() => setIsProductsOpen(true)} onMouseLeave={() => { setIsProductsOpen(false); setOpenCategoryId(null); }}>
              <button
                onClick={() => setIsProductsOpen((p) => !p)}
                className={`rounded-lg px-3 py-2 text-[13px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 focus:outline-none ${
                  isProductsOpen ? "bg-gray-50 text-blue-900" : "text-gray-600 hover:bg-gray-50 hover:text-blue-900"
                }`}
              >
                <span>Products</span>
                <svg className={`h-3 w-3 transition-transform duration-200 ${isProductsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProductsOpen && (
                <div className="absolute left-0 top-full mt-1 flex rounded-xl border border-gray-100 bg-white shadow-2xl z-30 overflow-hidden">
                  {/* Level 1: Categories */}
                  <div className="w-60 p-2 max-h-[420px] overflow-y-auto border-r border-gray-100">
                    {categories.map((cat) => {
                      const hasSubs = (cat.subcategories || []).filter((s) => s.isActive !== false).length > 0;
                      const isOpen = openCategoryId === cat.id;
                      return (
                        <div key={cat.id} onMouseEnter={() => hasSubs && setOpenCategoryId(cat.id)}>
                          <Link
                            href={`/products?categoryId=${cat.id}`}
                            onClick={() => { setIsProductsOpen(false); setOpenCategoryId(null); }}
                            className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
                              isOpen ? "bg-slate-50 text-blue-900" : "text-gray-600 hover:bg-slate-50 hover:text-blue-900"
                            }`}
                          >
                            <span className="truncate">{cat.name}</span>
                            {hasSubs && (
                              <svg className="h-3 w-3 -rotate-90 shrink-0 ml-2" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </Link>
                        </div>
                      );
                    })}
                  </div>

                  {/* Level 2: Subcategory flyout */}
                  {openCategoryId && (() => {
                    const activeCat = categories.find((c) => c.id === openCategoryId);
                    const subs = (activeCat?.subcategories || []).filter((s) => s.isActive !== false);
                    if (!subs.length) return null;
                    return (
                      <div className="w-56 p-2 max-h-[420px] overflow-y-auto">
                        <p className="px-3.5 pt-1.5 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {activeCat.name}
                        </p>
                        {subs.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/products?categoryId=${activeCat.id}&subcategoryId=${sub.id}`}
                            onClick={() => { setIsProductsOpen(false); setOpenCategoryId(null); }}
                            className="block rounded-lg px-3.5 py-2.5 text-xs font-bold text-gray-600 hover:bg-slate-50 hover:text-blue-900 transition-all truncate"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* ===== OTHER SERVICES DROPDOWN ===== */}
          {dropdownNavigation && dropdownNavigation.hasDropdown && (
            <div
              className="relative"
              onMouseEnter={() => setIsServicesDropdownOpen(true)}
              onMouseLeave={() => setIsServicesDropdownOpen(false)}
            >
              <button
                onClick={() => setIsServicesDropdownOpen(prev => !prev)}
                style={{
                  color: dropdownNavigation.fontColor,
                  fontSize: `${dropdownNavigation.fontSize}px`,
                  fontWeight: dropdownNavigation.fontWeight,
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = dropdownNavigation.hoverFontColor;
                  e.target.style.backgroundColor = dropdownNavigation.hoverBgColor;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = dropdownNavigation.fontColor;
                  e.target.style.backgroundColor = 'transparent';
                }}
                className="rounded-lg px-3 py-2 uppercase tracking-wider hover:bg-gray-50 hover:text-blue-900 transition-all whitespace-nowrap flex items-center gap-1.5"
              >
                {dropdownNavigation.name}
                <svg
                  className={`h-3 w-3 transition-transform ${isServicesDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isServicesDropdownOpen && (
                <div
                  className="absolute top-full mt-1 rounded-xl border border-gray-100 bg-white shadow-2xl z-30 overflow-hidden"
                  style={{
                    width: dropdownNavigation.dropdownWidth || 192,
                    borderRadius: dropdownNavigation.dropdownBorderRadius || 12,
                    boxShadow: dropdownNavigation.dropdownShadow ? '0 10px 25px rgba(0,0,0,0.1)' : 'none',
                    backgroundColor: dropdownNavigation.dropdownBgColor || '#fff',
                  }}
                >
                  {dropdownNavigation.dropdownItems
                    .filter(item => item.status !== false)
                    .map(item => (
                      <Link
                        key={item.id}
                        href={item.link}
                        onClick={() => setIsServicesDropdownOpen(false)}
                        className="block px-4 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-gray-50 transition-colors"
                        style={{ color: dropdownNavigation.dropdownTextColor || '#4B5563' }}
                      >
                        {item.name}
                      </Link>
                    ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Login button removed per request — public header has no auth UI */}
        <div className="hidden lg:block shrink-0" />

        {/* ===== MOBILE CONTROLS ===== */}
        <div className="flex items-center gap-2 lg:hidden">
          <button onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="rounded-xl p-2.5 text-gray-500 hover:bg-gray-100 hover:text-blue-900 md:hidden transition-colors" aria-label="Toggle search">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-xl p-2.5 text-gray-500 hover:bg-gray-100 hover:text-blue-900 transition-colors" aria-label="Toggle navigation">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ===== MOBILE SEARCH ===== */}
      {isSearchOpen && (
        <div ref={mobileSearchRef} className="relative border-t border-gray-100 bg-white px-4 py-3 md:hidden shadow-sm">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search products, news, brands..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-4 pr-10 py-3 text-xs font-semibold text-gray-900 focus:outline-none focus:border-blue-900 focus:bg-white transition-all" autoFocus />
            <button type="submit" className="absolute right-3.5 text-gray-500 p-1">🔍</button>
          </form>
          <div className="relative"><ResultsDropdown idPrefix="mobile" /></div>
        </div>
      )}

      {/* ===== DYNAMIC MOBILE MENU ===== */}
      {isMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-5 shadow-xl lg:hidden absolute top-20 left-0 w-full max-h-[calc(100vh-5rem)] overflow-y-auto z-10">
          <nav className="flex flex-col space-y-1.5">
            {allMobileLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-black uppercase tracking-wider text-gray-700 hover:bg-gray-50 hover:text-blue-900 transition-all">
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}