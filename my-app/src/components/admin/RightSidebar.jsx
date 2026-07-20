"use client";

import { useRouter } from "next/navigation";
import { ADMIN_TYPE_META } from "@/lib/adminGlobalSearchApi";

export default function RightSidebar({ isRightOpen, setIsRightOpen, searchResults = [] }) {
  const router = useRouter();

  const goTo = (href) => {
    router.push(href); // brings the result into the main frame
  };

  return (
    <aside
      className={`bg-white border-l border-slate-200/80 flex flex-col transition-all duration-300 shrink-0 z-30 shadow-xl h-full ${
        isRightOpen ? "w-[22%] min-w-[260px]" : "w-0 overflow-hidden border-none"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
        <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
          Search Stream
          {searchResults.length > 0 && (
            <span className="ml-2 text-[10px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              {searchResults.length}
            </span>
          )}
        </span>
        <button onClick={() => setIsRightOpen(false)} className="text-slate-400 hover:text-red-500 font-bold p-1 text-xs">✕</button>
      </div>

      {/* Results */}
      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
        {searchResults.length === 0 ? (
          <div className="text-center py-10 px-3">
            <span className="text-2xl">🔎</span>
            <p className="text-[11px] font-bold text-slate-400 mt-2 leading-relaxed">
              Type at least 2 characters in the search bar to find products, news,
              distributors, or admin sections.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {searchResults.map((item) => {
              const meta = ADMIN_TYPE_META[item.type] || {};
              return (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => goTo(item.href)}
                  className="w-full text-left py-3 px-2.5 cursor-pointer group hover:bg-slate-50 rounded-xl transition-all"
                >
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide ${meta.color || "text-blue-900 bg-blue-50"}`}>
                    {meta.label || item.type}
                  </span>
                  <p className="text-xs font-bold text-slate-700 mt-2 leading-snug group-hover:text-blue-900 transition-colors">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <span className="text-[10px] text-slate-400 block mt-1 font-medium">{item.subtitle}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}