"use client";
import { useState, useEffect } from "react";
import dashboardApi from "@/lib/dashboardApi";

function StatCard({ icon, label, value, color = "text-slate-900", sub }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black tracking-wider text-slate-400 uppercase">{label}</p>
          <h3 className={`text-2xl font-black mt-1.5 tracking-tight ${color}`}>
            {value === null || value === undefined ? "—" : value}
          </h3>
          {sub && <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{sub}</p>}
        </div>
        <span className="text-xl opacity-70">{icon}</span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 animate-pulse">
      <div className="h-2.5 bg-slate-200 rounded w-2/3 mb-3" />
      <div className="h-7 bg-slate-200 rounded w-1/2" />
    </div>
  );
}

function RfqAreaChart({ data, loading }) {
  const WIDTH = 760, HEIGHT = 220, PAD_L = 36, PAD_B = 24, PAD_T = 16, PAD_R = 12;

  if (loading) {
    return (
      <div className="h-[260px] flex items-center justify-center">
        <span className="w-7 h-7 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[260px] flex flex-col items-center justify-center text-slate-400 gap-2">
        <span className="text-3xl">📊</span>
        <p className="text-xs font-bold">No RFQ data yet</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.total), 5);
  const innerW = WIDTH - PAD_L - PAD_R;
  const innerH = HEIGHT - PAD_T - PAD_B;
  const stepX = innerW / Math.max(data.length - 1, 1);

  const xFor = (i) => PAD_L + i * stepX;
  const yFor = (v) => PAD_T + innerH - (v / max) * innerH;

  // Build smooth-ish path (simple line, then area fill below)
  const linePoints = data.map((d, i) => `${xFor(i)},${yFor(d.total)}`).join(" L ");
  const areaPath = `M ${xFor(0)},${yFor(0)} L ${linePoints} L ${xFor(data.length - 1)},${yFor(0)} Z`;
  const linePath = `M ${linePoints}`;

  // Y-axis gridlines (4 steps)
  const ySteps = 4;
  const gridLines = Array.from({ length: ySteps + 1 }, (_, i) => {
    const val = Math.round((max / ySteps) * i);
    return { y: yFor(val), val };
  });

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full min-w-[600px]" style={{ height: 260 }}>
        <defs>
          <linearGradient id="rfqGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Gridlines + y-axis labels */}
        {gridLines.map((g, i) => (
          <g key={i}>
            <line x1={PAD_L} x2={WIDTH - PAD_R} y1={g.y} y2={g.y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={PAD_L - 8} y={g.y + 3} textAnchor="end" fontSize="9" fill="#94a3b8" fontWeight="700">{g.val}</text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#rfqGradient)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#1e3a8a" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Data points + x-axis labels */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xFor(i)} cy={yFor(d.total)} r="3" fill="#1e3a8a" />
            {/* Show every other label on small datasets to avoid crowding */}
            {(data.length <= 8 || i % 2 === 0) && (
              <text x={xFor(i)} y={HEIGHT - 6} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="700">
                {d.month}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 px-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-950" />
          <span className="text-[10px] font-bold text-slate-500">Total RFQs</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats,   setStats]   = useState(null);
  const [trend,   setTrend]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardApi.getStats(), dashboardApi.getRfqTrend(12)])
      .then(([s, t]) => { setStats(s); setTrend(Array.isArray(t) ? t : []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { icon: "📨", label: "Total RFQs",     value: stats?.rfq?.total,    color: "text-slate-900" },
    { icon: "⏳", label: "Pending RFQs",    value: stats?.rfq?.pending,  color: "text-amber-600" },
    { icon: "✅", label: "Replied RFQs",    value: stats?.rfq?.replied,  color: "text-green-600" },
    { icon: "📦", label: "Total Products",  value: stats?.products,     color: "text-blue-700" },
    { icon: "📰", label: "Total News",      value: stats?.news,         color: "text-purple-700" },
    { icon: "✉️", label: "Total Subscribers", value: stats?.subscribers, color: "text-pink-600" },
    { icon: "👥", label: "Total Employees", value: stats?.employees,    color: "text-slate-700" },
    { icon: "🤝", label: "Total Clients",   value: stats?.clients,      color: "text-cyan-700" },
    { icon: "🏷️", label: "Total Brands",    value: stats?.brands,       color: "text-orange-700", sub: "Distributors + Own" },
    { icon: "⭐", label: "Own Brands",      value: stats?.ownBrands,    color: "text-emerald-700" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* RFQ Area Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-black text-slate-900">RFQ Trend</h2>
            <p className="text-[11px] text-slate-400 font-medium">Request for Quote volume over the last 12 months</p>
          </div>
        </div>
        <RfqAreaChart data={trend} loading={loading} />
      </div>
    </div>
  );
}