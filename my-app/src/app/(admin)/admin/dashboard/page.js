"use client";
import { useState, useEffect } from "react";
import dashboardApi from "@/lib/dashboardApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Mail,
  Clock,
  CheckCircle,
  Package,
  Newspaper,
  Users,
  UserPlus,
  Briefcase,
  Tag,
  Star,
  Heart,
  MessageCircle,
} from "lucide-react";

/* ---------- Stat Card Component ---------- */
function StatCard({ icon: Icon, label, value, color = "text-slate-900", sub }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
            {label}
          </p>
          <h3 className={`text-2xl font-black mt-1.5 tracking-tight ${color}`}>
            {value === null || value === undefined ? "—" : value}
          </h3>
          {sub && (
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              {sub}
            </p>
          )}
        </div>
        <Icon className="w-5 h-5 opacity-70" />
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

/* ---------- Growth Trend Chart ---------- */
function GrowthTrendChart({ data, loading }) {
  if (loading) {
    return (
      <div className="h-[260px] flex items-center justify-center">
        <span className="w-7 h-7 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }
  if (!data?.length) {
    return (
      <div className="h-[260px] flex items-center justify-center text-xs text-slate-400 font-semibold">
        No growth data available for this period
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 10,
            border: "1px solid #e2e8f0",
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
        <Line
          type="monotone"
          dataKey="subscribers"
          name="New Subscribers"
          stroke="#ec4899"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="products"
          name="Products Added"
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="news"
          name="News Published"
          stroke="#9333ea"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ---------- RFQ Area Chart ---------- */
function RfqAreaChart({ data, loading }) {
  const WIDTH = 760,
    HEIGHT = 220,
    PAD_L = 36,
    PAD_B = 24,
    PAD_T = 16,
    PAD_R = 12;

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
        <p className="text-xs font-bold">No RFQ data available for this period</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.total), 5);
  const innerW = WIDTH - PAD_L - PAD_R;
  const innerH = HEIGHT - PAD_T - PAD_B;
  const stepX = innerW / Math.max(data.length - 1, 1);

  const xFor = (i) => PAD_L + i * stepX;
  const yFor = (v) => PAD_T + innerH - (v / max) * innerH;

  const linePoints = data
    .map((d, i) => `${xFor(i)},${yFor(d.total)}`)
    .join(" L ");
  const areaPath = `M ${xFor(0)},${yFor(0)} L ${linePoints} L ${xFor(data.length - 1)},${yFor(0)} Z`;
  const linePath = `M ${linePoints}`;

  const ySteps = 4;
  const gridLines = Array.from({ length: ySteps + 1 }, (_, i) => {
    const val = Math.round((max / ySteps) * i);
    return { y: yFor(val), val };
  });

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full min-w-[600px]"
        style={{ height: 260 }}
      >
        <defs>
          <linearGradient id="rfqGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={PAD_L}
              x2={WIDTH - PAD_R}
              y1={g.y}
              y2={g.y}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
            <text
              x={PAD_L - 8}
              y={g.y + 3}
              textAnchor="end"
              fontSize="9"
              fill="#94a3b8"
              fontWeight="700"
            >
              {g.val}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#rfqGradient)" />
        <path
          d={linePath}
          fill="none"
          stroke="#1e3a8a"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xFor(i)} cy={yFor(d.total)} r="3" fill="#1e3a8a" />
            {(data.length <= 12 || i % Math.ceil(data.length / 10) === 0) && (
              <text
                x={xFor(i)}
                y={HEIGHT - 6}
                textAnchor="middle"
                fontSize="9"
                fill="#94a3b8"
                fontWeight="700"
              >
                {d.label}
              </text>
            )}
          </g>
        ))}
      </svg>

      <div className="flex items-center gap-4 mt-2 px-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-950" />
          <span className="text-[10px] font-bold text-slate-500">
            Total RFQs
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Admin Dashboard ---------- */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [growthDisplay, setGrowthDisplay] = useState("month"); // day | week | month | year

  const [growthData, setGrowthData] = useState([]);
  const [growthLoading, setGrowthLoading] = useState(false);
  const [growthPeriod, setGrowthPeriod] = useState("month"); // day | week | month | year

  const [rfqData, setRfqData] = useState([]);
  const [rfqLoading, setRfqLoading] = useState(false);
  const [rfqPeriod, setRfqPeriod] = useState("month"); // day | week | month | year

  // ----- Fetch Overall Dashboard Stats (Reacts to global timeframe filter) -----
  useEffect(() => {
    let cancelled = false;
    setStatsLoading(true);

    dashboardApi
      .getStats(growthDisplay)
      .then((res) => {
        if (!cancelled) setStats(res);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard stats:", err);
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [growthDisplay]);

  // ----- Fetch Growth Trend data whenever growthPeriod changes -----
  useEffect(() => {
    let cancelled = false;
    setGrowthLoading(true);

    const fetchGrowth = async () => {
      try {
        // Calls dashboardApi.getGrowthTrend passing the active period string ("day", "week", "month", "year")
        const raw = await dashboardApi.getGrowthTrend(growthPeriod);

        if (!cancelled) {
          const formatted = (Array.isArray(raw) ? raw : []).map((item) => ({
            label:
              item.hour ??
              item.day ??
              item.week ??
              item.month ??
              item.year ??
              item.label ??
              "",
            subscribers: item.subscribers ?? 0,
            products: item.products ?? 0,
            news: item.news ?? 0,
          }));
          setGrowthData(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch growth trend:", err);
      } finally {
        if (!cancelled) setGrowthLoading(false);
      }
    };

    fetchGrowth();
    return () => {
      cancelled = true;
    };
  }, [growthPeriod]);

  // ----- Fetch RFQ trend data whenever rfqPeriod changes -----
  useEffect(() => {
    let cancelled = false;
    setRfqLoading(true);

    const fetchRfq = async () => {
      try {
        // Calls dashboardApi.getRfqTrend passing the active period string ("day", "week", "month", "year")
        const raw = await dashboardApi.getRfqTrend(rfqPeriod);

        if (!cancelled) {
          const formatted = (Array.isArray(raw) ? raw : []).map((item) => ({
            label:
              item.hour ??
              item.day ??
              item.week ??
              item.month ??
              item.year ??
              item.label ??
              "",
            total: item.total ?? 0,
          }));
          setRfqData(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch RFQ trend:", err);
      } finally {
        if (!cancelled) setRfqLoading(false);
      }
    };

    fetchRfq();
    return () => {
      cancelled = true;
    };
  }, [rfqPeriod]);

  // ----- Helper to format growth sub-text on Stat Cards -----
  const buildGrowthSub = (key) => {
    if (!stats?.growth) return undefined;
    const item = stats.growth[key];
    if (!item) return undefined;

    switch (growthDisplay) {
      case "day":
        return `+${item.today ?? item.thisDay ?? 0} today`;
      case "week":
        return `+${item.thisWeek ?? 0} this week`;
      case "year":
        return `+${item.thisYear ?? 0} this year`;
      case "month":
      default:
        return `+${item.thisMonth ?? 0} this month`;
    }
  };

  const cards = [
    { icon: Mail, label: "Total RFQs", value: stats?.rfq?.total, color: "text-slate-900" },
    { icon: Clock, label: "Pending RFQs", value: stats?.rfq?.pending, color: "text-amber-600" },
    { icon: CheckCircle, label: "Replied RFQs", value: stats?.rfq?.replied, color: "text-green-600" },
    {
      icon: Package,
      label: "Total Products",
      value: stats?.products,
      color: "text-blue-700",
      sub: buildGrowthSub("products"),
    },
    {
      icon: Newspaper,
      label: "Total News",
      value: stats?.news,
      color: "text-purple-700",
      sub: buildGrowthSub("news"),
    },
    {
      icon: UserPlus,
      label: "Total Subscribers",
      value: stats?.subscribers,
      color: "text-pink-600",
      sub: buildGrowthSub("subscribers"),
    },
    { icon: Users, label: "Total Employees", value: stats?.employees, color: "text-slate-700" },
    { icon: Briefcase, label: "Total Clients", value: stats?.clients, color: "text-cyan-700" },
    {
      icon: Tag,
      label: "Total Brands",
      value: stats?.brands,
      color: "text-orange-700",
      sub: "Distributors + Own",
    },
    { icon: Star, label: "Own Brands", value: stats?.ownBrands, color: "text-emerald-700" },
    { icon: Heart, label: "News Likes", value: stats?.engagement?.totalLikes, color: "text-rose-600" },
    { icon: MessageCircle, label: "News Comments", value: stats?.engagement?.totalComments, color: "text-indigo-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Global stats period filter */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
          Stats timeframe:
        </span>
        <select
          value={growthDisplay}
          onChange={(e) => setGrowthDisplay(e.target.value)}
          className="text-[11px] font-semibold border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsLoading
          ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Trend Section */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-black text-slate-900">Growth Trend</h2>
              <p className="text-[11px] text-slate-400 font-medium">
                New subscribers, products, and news
              </p>
            </div>
            <select
              value={growthPeriod}
              onChange={(e) => setGrowthPeriod(e.target.value)}
              className="text-[11px] font-semibold border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
          <GrowthTrendChart data={growthData} loading={growthLoading} />
        </div>

        {/* RFQ Trend Section */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-black text-slate-900">RFQ Trend</h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Request for Quote volume
              </p>
            </div>
            <select
              value={rfqPeriod}
              onChange={(e) => setRfqPeriod(e.target.value)}
              className="text-[11px] font-semibold border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
          <RfqAreaChart data={rfqData} loading={rfqLoading} />
        </div>
      </div>
    </div>
  );
}