// src/components/admin/Footer.jsx
"use client";

export default function Footer({ theme }) {
  const isDark = theme === "dark";

  return (
    <footer className={`border-t px-6 py-3 flex items-center justify-between text-[10px] font-mono shrink-0 transition-colors duration-300 ${
      isDark
        ? "bg-slate-900 border-slate-700/50 text-slate-500"
        : "bg-white border-slate-100 text-slate-400"
    }`}>
      <span>© 2026 SBS Group Admin Console</span>
      <div className="flex items-center gap-4">
        <span className={isDark ? "text-green-400" : "text-green-600"}>
          ● System Online
        </span>
        <span>v2.0.0</span>
      </div>
    </footer>
  );
}