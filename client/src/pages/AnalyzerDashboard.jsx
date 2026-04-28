import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchComplaintAnalytics } from "../services/complaints";

const PRIORITY_COLOR = {
  critical: { bg: "#fee2e2", text: "#991b1b", bar: "#ef4444", dot: "#dc2626" },
  high:     { bg: "#ffedd5", text: "#9a3412", bar: "#f97316", dot: "#ea580c" },
  medium:   { bg: "#fef9c3", text: "#854d0e", bar: "#eab308", dot: "#ca8a04" },
  low:      { bg: "#dcfce7", text: "#166534", bar: "#22c55e", dot: "#16a34a" },
};
const SLA_COLOR = {
  on_track: { bg: "#dcfce7", text: "#166534", bar: "#22c55e" },
  at_risk:  { bg: "#fef9c3", text: "#854d0e", bar: "#eab308" },
  breached: { bg: "#fee2e2", text: "#991b1b", bar: "#ef4444" },
};
const STATUS_BAR = {
  pending: "#f59e0b", verified: "#0ea5e9", assigned: "#8b5cf6",
  in_progress: "#3b82f6", completed: "#10b981", approved_by_user: "#22c55e",
  rejected: "#ef4444", rejected_by_user: "#f43f5e", user_approval_pending: "#f97316",
};

// ─── Tiny SVG bar chart ────────────────────────────────────────────────────
const MiniBar = ({ data, colorKey, W = 460, H = 140 }) => {
  if (!data?.length) return <p className="text-slate-400 text-sm text-center py-6">No data</p>;
  const max = Math.max(...data.map(d => d.count), 1);
  const bw = Math.max(20, Math.floor((W - 40) / data.length) - 6);
  const gap = Math.floor((W - 40 - bw * data.length) / (data.length - 1 || 1));
  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full">
      {data.map((d, i) => {
        const bh = Math.max(4, ((d.count / max) * (H - 20)));
        const x = 20 + i * (bw + gap);
        const y = H - bh;
        const color = colorKey ? (colorKey[d._id] || "#94a3b8") : "#3b82f6";
        const barColor = typeof color === "object" ? color.bar : color;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx="4" fill={barColor} opacity="0.85" />
            <text x={x + bw / 2} y={y - 4} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">{d.count}</text>
            <text x={x + bw / 2} y={H + 14} textAnchor="middle" fontSize="9" fill="#94a3b8"
              style={{ textTransform: "capitalize" }}>
              {(d._id || "?").toString().slice(0, 8)}
            </text>
          </g>
        );
      })}
      <line x1="20" y1={H} x2={W - 20} y2={H} stroke="#e2e8f0" strokeWidth="1" />
    </svg>
  );
};

// ─── Weekly trend sparkline ────────────────────────────────────────────────
const WeeklySparkline = ({ weeklyTrend = [] }) => {
  if (!weeklyTrend.length) return <p className="text-slate-400 text-sm text-center py-6">No weekly data</p>;
  const W = 460, H = 100;
  const counts = weeklyTrend.map(w => w.count);
  const max = Math.max(...counts, 1);
  const pts = counts.map((c, i) => {
    const x = 20 + (i / (counts.length - 1 || 1)) * (W - 40);
    const y = H - 10 - ((c / max) * (H - 20));
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full">
      <polyline points={polyline} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
      {pts.map((pt, i) => {
        const [x, y] = pt.split(",").map(Number);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="3" fill="#3b82f6" />
            <text x={x} y={y - 7} textAnchor="middle" fontSize="9" fill="#64748b">{counts[i]}</text>
            <text x={x} y={H + 18} textAnchor="middle" fontSize="9" fill="#94a3b8">
              W{weeklyTrend[i]?._id?.week || i + 1}
            </text>
          </g>
        );
      })}
      <line x1="20" y1={H} x2={W - 20} y2={H} stroke="#e2e8f0" strokeWidth="1" />
    </svg>
  );
};

// ─── Heatmap ──────────────────────────────────────────────────────────────
const buildHeatmap = (dailyTrend = []) => {
  const map = {};
  dailyTrend.forEach(({ _id, count }) => { map[_id] = count; });
  const today = new Date();
  const days = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: map[key] || 0, label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) });
  }
  return days;
};
const heatColor = (c) => c === 0 ? "#f1f5f9" : c <= 2 ? "#bfdbfe" : c <= 5 ? "#60a5fa" : c <= 10 ? "#2563eb" : "#1e3a8a";

const Heatmap = ({ dailyTrend }) => {
  const days = buildHeatmap(dailyTrend);
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return (
    <div>
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 mr-1 w-7">
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <span key={i} className="text-[10px] text-slate-400 h-4 flex items-center justify-end">{d}</span>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1 flex-1">
            {week.map((day, di) => (
              <div key={di} title={`${day.label}: ${day.count} complaints`}
                className="h-4 rounded-sm cursor-default hover:scale-125 transition-transform"
                style={{ background: heatColor(day.count) }} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10px] text-slate-400">Less</span>
        {["#f1f5f9","#bfdbfe","#60a5fa","#2563eb","#1e3a8a"].map(c => (
          <div key={c} className="w-3.5 h-3.5 rounded-sm" style={{ background: c }} />
        ))}
        <span className="text-[10px] text-slate-400">More</span>
      </div>
    </div>
  );
};

// ─── KPI Card ────────────────────────────────────────────────────────────
const KPICard = ({ label, value, sub, accent, icon }) => (
  <div className={`rounded-2xl bg-white border-l-4 ${accent} p-5 shadow-sm`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-3xl font-black text-slate-900 mt-1">{value ?? "—"}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
      <span className="text-2xl opacity-60">{icon}</span>
    </div>
  </div>
);

// ─── Donut chart (SVG) ───────────────────────────────────────────────────
const Donut = ({ data, colors, size = 120 }) => {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (!total) return null;
  const R = size / 2 - 10, cx = size / 2, cy = size / 2;
  let angle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const pct = d.count / total;
    const a1 = angle, a2 = angle + pct * 2 * Math.PI;
    angle = a2;
    const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
    const x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
    const large = pct > 0.5 ? 1 : 0;
    const color = colors?.[d._id] || "#94a3b8";
    const barColor = typeof color === "object" ? color.bar : color;
    return (
      <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`}
        fill={barColor} opacity="0.85" />
    );
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices}
      <circle cx={cx} cy={cy} r={R * 0.55} fill="white" />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e293b">{total}</text>
    </svg>
  );
};

// ─── Horizontal bar ───────────────────────────────────────────────────────
const HBar = ({ label, count, max, color, sub }) => (
  <div className="flex items-center gap-3 text-sm">
    <div className="w-32 text-right flex-shrink-0">
      <p className="text-xs font-medium text-slate-700 truncate">{label || "Unknown"}</p>
      {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
    </div>
    <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
      <div className="h-2.5 rounded-full transition-all duration-700"
        style={{ width: `${max ? (count / max) * 100 : 0}%`, background: color || "#3b82f6" }} />
    </div>
    <span className="w-10 text-right font-bold text-slate-700 text-xs flex-shrink-0">{count}</span>
  </div>
);

// ─── Resolution time table ────────────────────────────────────────────────
const ResolutionTable = ({ data = [] }) => {
  if (!data.length) return <p className="text-slate-400 text-sm text-center py-6">No resolved complaints yet</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-2 px-3 text-slate-400 text-xs font-bold uppercase tracking-wider">Department</th>
            <th className="text-right py-2 px-3 text-slate-400 text-xs font-bold uppercase tracking-wider">Avg Hours</th>
            <th className="text-right py-2 px-3 text-slate-400 text-xs font-bold uppercase tracking-wider">Avg Days</th>
            <th className="text-right py-2 px-3 text-slate-400 text-xs font-bold uppercase tracking-wider">Resolved</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const hrs = Math.round(row.avgResolutionHours || 0);
            const days = (hrs / 24).toFixed(1);
            const good = hrs < 48;
            return (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-2.5 px-3 font-medium text-slate-800">{row._id || "Unassigned"}</td>
                <td className="py-2.5 px-3 text-right">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${good ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {hrs}h
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right text-slate-600 font-medium">{days}d</td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-700">{row.totalResolved}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─── Priority vs Resolution ────────────────────────────────────────────────
const PriorityMatrix = ({ data = [] }) => {
  if (!data.length) return <p className="text-slate-400 text-sm text-center py-6">No data</p>;
  const ORDER = ["critical", "high", "medium", "low"];
  const sorted = [...data].sort((a, b) => ORDER.indexOf(a._id) - ORDER.indexOf(b._id));
  return (
    <div className="space-y-3">
      {sorted.map((row) => {
        const pct = row.total > 0 ? Math.round((row.resolved / row.total) * 100) : 0;
        const breachPct = row.total > 0 ? Math.round((row.breached / row.total) * 100) : 0;
        const c = PRIORITY_COLOR[row._id] || PRIORITY_COLOR.medium;
        return (
          <div key={row._id} className="rounded-xl border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
                <span className="text-sm font-semibold capitalize text-slate-700">{row._id}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: c.bg, color: c.text }}>
                  {row.total} total
                </span>
              </div>
              <div className="flex gap-3 text-xs text-slate-500">
                <span className="text-emerald-600 font-bold">{pct}% resolved</span>
                <span className="text-red-500 font-bold">{breachPct}% breached</span>
              </div>
            </div>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-slate-100">
              <div className="h-full bg-emerald-400 transition-all duration-700" style={{ width: `${pct}%` }} />
              <div className="h-full bg-red-400 transition-all duration-700" style={{ width: `${breachPct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── SLA dashboard ────────────────────────────────────────────────────────
const SLAPanel = ({ slaBreakdown = [], kpis = {} }) => {
  const total = slaBreakdown.reduce((s, x) => s + x.count, 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {["on_track", "at_risk", "breached"].map(key => {
          const item = slaBreakdown.find(x => x._id === key);
          const count = item?.count || 0;
          const c = SLA_COLOR[key];
          const pct = total ? Math.round((count / total) * 100) : 0;
          return (
            <div key={key} className="rounded-xl p-4 text-center" style={{ background: c.bg }}>
              <p className="text-2xl font-black" style={{ color: c.text }}>{count}</p>
              <p className="text-xs font-bold capitalize mt-1" style={{ color: c.text }}>{key.replace("_", " ")}</p>
              <p className="text-[11px] mt-0.5" style={{ color: c.text, opacity: 0.7 }}>{pct}%</p>
            </div>
          );
        })}
      </div>
      <div className="rounded-xl border border-slate-100 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-slate-700">SLA Compliance Rate</span>
          <span className={`text-lg font-black ${(kpis.slaCompliance || 0) >= 80 ? "text-emerald-600" : "text-red-600"}`}>
            {kpis.slaCompliance ?? "—"}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div className="h-3 rounded-full transition-all duration-700"
            style={{ width: `${kpis.slaCompliance || 0}%`, background: (kpis.slaCompliance || 0) >= 80 ? "#22c55e" : "#ef4444" }} />
        </div>
      </div>
    </div>
  );
};

// ─── Department deep report ────────────────────────────────────────────────
const DeptReport = ({ data = [] }) => {
  if (!data.length) return <p className="text-slate-400 text-sm text-center py-6">No department data</p>;
  const maxT = Math.max(...data.map(d => d.total), 1);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {["Department","Total","Pending","In Progress","Completed","Breached","Load"].map(h => (
              <th key={h} className={`py-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-400 ${h === "Department" ? "text-left" : "text-center"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="py-2.5 px-2 font-semibold text-slate-800 max-w-[140px] truncate">{d._id?.departmentName || "Unassigned"}</td>
              <td className="py-2.5 px-2 text-center font-bold text-slate-700">{d.total}</td>
              <td className="py-2.5 px-2 text-center text-amber-600 font-medium">{d.pending}</td>
              <td className="py-2.5 px-2 text-center text-blue-600 font-medium">{d.inProgress}</td>
              <td className="py-2.5 px-2 text-center text-emerald-600 font-medium">{d.completed}</td>
              <td className="py-2.5 px-2 text-center">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${d.breached > 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-400"}`}>{d.breached}</span>
              </td>
              <td className="py-2.5 px-2 w-24">
                <div className="w-full bg-slate-100 rounded-full h-2"><div className="h-2 rounded-full bg-blue-500" style={{ width: `${(d.total / maxT) * 100}%` }} /></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Monthly summary ───────────────────────────────────────────────────────
const MonthlyChart = ({ dailyTrend = [] }) => {
  const monthly = useMemo(() => {
    const map = {};
    dailyTrend.forEach(({ _id, count }) => { const m = _id.slice(0, 7); map[m] = (map[m] || 0) + count; });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-8)
      .map(([month, count]) => ({ _id: new Date(month + "-01").toLocaleDateString("en-IN", { month: "short", year: "2-digit" }), count }));
  }, [dailyTrend]);
  return <MiniBar data={monthly} W={520} H={120} />;
};

// ─── Geo / Taluka breakdown ────────────────────────────────────────────────
const TalukaReport = ({ data = [] }) => {
  if (!data.length) return <p className="text-slate-400 text-sm text-center py-6">No taluka data</p>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {data.slice(0, 20).map((item, i) => (
        <HBar key={i}
          label={item._id?.taluka || item._id || "—"}
          sub={item._id?.district}
          count={item.count}
          max={max}
          color="#8b5cf6" />
      ))}
    </div>
  );
};

// ─── TABS config ──────────────────────────────────────────────────────────
const TABS = [
  { id: "kpi",        label: "🎯 KPIs" },
  { id: "status",     label: "📊 Status" },
  { id: "sla",        label: "⏱ SLA" },
  { id: "priority",   label: "🚨 Priority" },
  { id: "heatmap",    label: "🗓 Heatmap" },
  { id: "department", label: "🏢 Departments" },
  { id: "resolution", label: "⚡ Resolution" },
  { id: "geo",        label: "📍 Geography" },
  { id: "monthly",    label: "📈 Monthly" },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────
const AnalyzerDashboard = () => {
  const nav = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("kpi");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "analyzer") { nav("/"); return; }
    (async () => {
      setLoading(true);
      const res = await fetchComplaintAnalytics();
      if (res.success) setAnalytics(res.analytics || {});
      else setError(res.message || "Unable to load analytics.");
      setLoading(false);
    })();
  }, [nav]);

  const sv = (s) => analytics?.statusBreakdown?.find(x => x._id === s)?.count || 0;
  const maxS = useMemo(() => Math.max(...(analytics?.statusBreakdown?.map(x => x.count) || [1])), [analytics]);
  const maxC = useMemo(() => Math.max(...(analytics?.categoryBreakdown?.map(x => x.count) || [1])), [analytics]);
  const kpis = analytics?.kpis || {};

  if (loading) return (
    <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading analytics…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-12 shadow text-center text-red-500 max-w-md">
        <p className="text-4xl mb-4">⚠️</p>
        <p className="font-semibold">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Hero */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white p-8 sm:p-10 shadow-2xl mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, #3b82f6 0%, transparent 60%)" }} />
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-blue-300 mb-2">Analytics Workspace</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Analyzer Dashboard</h1>
          <p className="mt-2 text-slate-300 text-sm max-w-2xl">Full complaint intelligence — SLA tracking, priority matrix, resolution speed, geographic breakdown & more.</p>
          {/* Quick KPI strip */}
          {analytics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {[
                { label: "Total",       val: analytics.totalComplaints, color: "bg-white/10" },
                { label: "Resolution",  val: `${kpis.resolutionRate ?? "—"}%`, color: "bg-emerald-500/20" },
                { label: "SLA OK",      val: `${kpis.slaCompliance ?? "—"}%`, color: "bg-blue-500/20" },
                { label: "Last 7 Days", val: kpis.recentCount ?? "—", color: "bg-violet-500/20" },
              ].map(k => (
                <div key={k.label} className={`${k.color} rounded-xl px-4 py-3 backdrop-blur-sm`}>
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">{k.label}</p>
                  <p className="text-white text-2xl font-black mt-0.5">{k.val}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-1 mb-6 shadow-sm overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  tab === t.id ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPIs ── */}
        {tab === "kpi" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard label="Total Complaints" value={analytics.totalComplaints} icon="📋" accent="border-l-blue-500" />
              <KPICard label="Resolution Rate" value={`${kpis.resolutionRate ?? 0}%`} sub={`${kpis.resolvedCount} resolved`} icon="✅" accent="border-l-emerald-500" />
              <KPICard label="SLA Compliance" value={`${kpis.slaCompliance ?? 0}%`} sub={`${kpis.slaBreachedCount} breached`} icon="⏱" accent="border-l-blue-400" />
              <KPICard label="Last 7 Days" value={kpis.recentCount ?? "—"} sub="new complaints" icon="📅" accent="border-l-violet-500" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard label="Pending" value={sv("pending")} icon="🕐" accent="border-l-amber-400" />
              <KPICard label="In Progress" value={sv("in_progress")} icon="🔧" accent="border-l-blue-400" />
              <KPICard label="Escalated" value={analytics.escalationStats?.totalEscalated ?? "—"} sub={`avg ${(analytics.escalationStats?.avgEscalationCount || 0).toFixed(1)}x`} icon="🔺" accent="border-l-red-500" />
              <KPICard label="Departments" value={analytics.departmentBreakdown?.length ?? "—"} icon="🏢" accent="border-l-teal-500" />
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Weekly Volume (Last 12 Weeks)</h3>
                <WeeklySparkline weeklyTrend={analytics.weeklyTrend} />
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Priority Distribution</h3>
                <div className="flex items-center gap-6">
                  <Donut data={analytics.priorityBreakdown || []} colors={PRIORITY_COLOR} size={110} />
                  <div className="flex-1 space-y-2">
                    {(analytics.priorityBreakdown || []).map(p => {
                      const c = PRIORITY_COLOR[p._id] || PRIORITY_COLOR.medium;
                      return (
                        <div key={p._id} className="flex items-center gap-2 text-xs">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.dot }} />
                          <span className="capitalize text-slate-600 flex-1">{p._id}</span>
                          <span className="font-bold text-slate-700">{p.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STATUS ── */}
        {tab === "status" && (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Status Breakdown</h3>
              <div className="space-y-3">
                {(analytics.statusBreakdown || []).map(item => (
                  <div key={item._id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                        style={{ background: (STATUS_BAR[item._id] || "#94a3b8") + "20", color: STATUS_BAR[item._id] || "#64748b" }}>
                        {item._id}
                      </span>
                      <span className="text-sm font-bold text-slate-700">{item.count}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all duration-700"
                        style={{ width: `${(item.count / maxS) * 100}%`, background: STATUS_BAR[item._id] || "#94a3b8" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Top Categories</h3>
              <div className="space-y-2.5">
                {(analytics.categoryBreakdown || []).slice(0, 12).map(item => (
                  <HBar key={item._id} label={item._id || "Other"} count={item.count} max={maxC} color="#8b5cf6" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SLA ── */}
        {tab === "sla" && (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-4">SLA Status Overview</h3>
              <SLAPanel slaBreakdown={analytics.slaBreakdown || []} kpis={kpis} />
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-4">SLA Breakdown Chart</h3>
              <MiniBar data={analytics.slaBreakdown || []} colorKey={SLA_COLOR} H={120} />
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 xl:col-span-2">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Escalation Stats</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total Escalated", val: analytics.escalationStats?.totalEscalated ?? 0 },
                  { label: "Avg Escalations", val: (analytics.escalationStats?.avgEscalationCount || 0).toFixed(2) },
                  { label: "Max Escalations", val: analytics.escalationStats?.maxEscalations ?? 0 },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-red-50 border border-red-100 p-4 text-center">
                    <p className="text-2xl font-black text-red-700">{s.val}</p>
                    <p className="text-xs text-red-500 font-semibold mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PRIORITY ── */}
        {tab === "priority" && (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Priority vs Resolution Matrix</h3>
              <PriorityMatrix data={analytics.priorityVsResolution || []} />
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Priority Distribution</h3>
              <div className="flex items-center gap-8 mb-6">
                <Donut data={analytics.priorityBreakdown || []} colors={PRIORITY_COLOR} size={120} />
                <div className="flex-1 space-y-2.5">
                  {(analytics.priorityBreakdown || []).map(p => {
                    const c = PRIORITY_COLOR[p._id] || PRIORITY_COLOR.medium;
                    const pct = analytics.totalComplaints ? Math.round((p.count / analytics.totalComplaints) * 100) : 0;
                    return (
                      <div key={p._id}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="capitalize font-semibold" style={{ color: c.text }}>{p._id}</span>
                          <span className="font-bold text-slate-700">{p.count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: c.bar }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <MiniBar data={analytics.priorityBreakdown || []} colorKey={PRIORITY_COLOR} H={100} />
            </div>
          </div>
        )}

        {/* ── HEATMAP ── */}
        {tab === "heatmap" && (
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 mb-1">Activity Heatmap (Last 90 Days)</h3>
            <p className="text-xs text-slate-400 mb-6">Each cell = 1 day. Darker = more complaints.</p>
            <Heatmap dailyTrend={analytics.dailyTrend || []} />
            <div className="mt-8 grid grid-cols-3 sm:grid-cols-6 md:grid-cols-10 gap-2">
              {[...(analytics.dailyTrend || [])].reverse().slice(0, 30).map(row => (
                <div key={row._id} className="rounded-lg border border-slate-100 p-2 text-center bg-slate-50">
                  <p className="text-[9px] text-slate-400 leading-tight">{row._id?.slice(5)}</p>
                  <p className="text-base font-black text-blue-600">{row.count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DEPARTMENTS ── */}
        {tab === "department" && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Department Performance Report</h3>
              <DeptReport data={analytics.departmentBreakdown || []} />
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Department Load</h3>
              <div className="space-y-2.5">
                {(analytics.departmentBreakdown || []).map((d, i) => (
                  <HBar key={i}
                    label={d._id?.departmentName || "Unassigned"}
                    count={d.total}
                    max={Math.max(...(analytics.departmentBreakdown || []).map(x => x.total), 1)}
                    color="#3b82f6" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RESOLUTION ── */}
        {tab === "resolution" && (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 xl:col-span-2">
              <h3 className="text-sm font-bold text-slate-700 mb-1">Average Resolution Time by Department</h3>
              <p className="text-xs text-slate-400 mb-4">Green = under 48h. Red = over 48h.</p>
              <ResolutionTable data={analytics.resolutionTimeStats || []} />
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Resolution Bar Chart</h3>
              <MiniBar
                data={(analytics.resolutionTimeStats || []).slice(0, 8).map(r => ({
                  _id: r._id?.slice(0, 12) || "—",
                  count: Math.round(r.avgResolutionHours || 0)
                }))}
                H={120} />
              <p className="text-xs text-slate-400 text-center mt-2">Average hours to resolve</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Weekly Volume Trend</h3>
              <WeeklySparkline weeklyTrend={analytics.weeklyTrend || []} />
            </div>
          </div>
        )}

        {/* ── GEOGRAPHY ── */}
        {tab === "geo" && (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-4">By Taluka</h3>
              <TalukaReport data={analytics.talukaBreakdown || []} />
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-4">City / District Breakdown</h3>
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 px-2 text-slate-400 text-xs font-bold uppercase tracking-wider">City</th>
                      <th className="text-left py-2 px-2 text-slate-400 text-xs font-bold uppercase tracking-wider">District</th>
                      <th className="text-right py-2 px-2 text-slate-400 text-xs font-bold uppercase tracking-wider">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics.locationBreakdown || []).slice(0, 20).map((item, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-2 px-2 font-medium text-slate-700">{item._id?.city || "—"}</td>
                        <td className="py-2 px-2 text-slate-500 text-xs">{item._id?.district || "—"}</td>
                        <td className="py-2 px-2 text-right font-bold text-slate-800">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── MONTHLY ── */}
        {tab === "monthly" && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Monthly Complaint Volume (Last 8 Months)</h3>
              <MonthlyChart dailyTrend={analytics.dailyTrend || []} />
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Monthly Summary Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 px-3 text-slate-400 text-xs font-bold uppercase tracking-wider">Month</th>
                      <th className="text-right py-2 px-3 text-slate-400 text-xs font-bold uppercase tracking-wider">Complaints</th>
                      <th className="py-2 px-3 text-slate-400 text-xs font-bold uppercase tracking-wider w-48">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const map = {};
                      (analytics.dailyTrend || []).forEach(({ _id, count }) => { const m = _id.slice(0, 7); map[m] = (map[m] || 0) + count; });
                      const entries = Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
                      const maxM = Math.max(...entries.map(([, v]) => v), 1);
                      return entries.map(([month, count]) => (
                        <tr key={month} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-slate-700">
                            {new Date(month + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-blue-600">{count}</td>
                          <td className="py-2 px-3">
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="h-2 rounded-full bg-blue-500" style={{ width: `${(count / maxM) * 100}%` }} />
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AnalyzerDashboard;