import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchComplaintAnalytics } from "../services/complaints";

// ─── Color maps ────────────────────────────────────────────────────────────
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

// ─── Shared chart palette for Chart.js ────────────────────────────────────
const CHART_COLORS = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#0ea5e9","#f97316","#22c55e"];

// ─── Utility ──────────────────────────────────────────────────────────────
const fmt = (n) => (n == null ? "—" : Number(n).toLocaleString("en-IN"));

// ─── KPI Card ────────────────────────────────────────────────────────────
const KPICard = ({ label, value, sub, borderColor, icon }) => (
  <div style={{
    background: "var(--bg-primary)",
    borderRadius: 16,
    border: "1px solid var(--border-color)",
    borderLeft: `4px solid ${borderColor}`,
    padding: "20px 22px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", margin: 0 }}>{label}</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: "6px 0 0" }}>{value}</p>
        {sub && <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "2px 0 0" }}>{sub}</p>}
      </div>
      <span style={{ fontSize: 20, opacity: 0.5 }}>{icon}</span>
    </div>
  </div>
);

// ─── Section card wrapper ─────────────────────────────────────────────────
const Card = ({ title, subtitle, children, style = {} }) => (
  <div style={{
    background: "var(--bg-primary)",
    borderRadius: 16,
    border: "1px solid var(--border-color)",
    padding: "24px",
    ...style,
  }}>
    {title && (
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "4px 0 0" }}>{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

// ─── Horizontal bar ───────────────────────────────────────────────────────
const HBar = ({ label, count, max, color, sub }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
    <div style={{ width: 120, textAlign: "right", flexShrink: 0 }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label || "Unknown"}</p>
      {sub && <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>{sub}</p>}
    </div>
    <div style={{ flex: 1, background: "var(--bg-secondary)", borderRadius: 99, height: 8, overflow: "hidden" }}>
      <div style={{ height: 8, borderRadius: 99, width: `${max ? (count / max) * 100 : 0}%`, background: color || "#3b82f6", transition: "width 0.7s ease" }} />
    </div>
    <span style={{ width: 36, textAlign: "right", fontWeight: 700, color: "var(--text-primary)", fontSize: 12, flexShrink: 0 }}>{count}</span>
  </div>
);

// ─── SVG Donut ───────────────────────────────────────────────────────────
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
    const color = colors?.[d._id] || CHART_COLORS[i % CHART_COLORS.length];
    const barColor = typeof color === "object" ? color.bar : color;
    return (
      <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`}
        fill={barColor} opacity="0.9" />
    );
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices}
      <circle cx={cx} cy={cy} r={R * 0.55} fill="var(--bg-primary)" />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-primary)">{total}</text>
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
const heatColor = (c) => c === 0 ? "var(--bg-secondary)" : c <= 2 ? "#bfdbfe" : c <= 5 ? "#60a5fa" : c <= 10 ? "#2563eb" : "#1e3a8a";

const Heatmap = ({ dailyTrend }) => {
  const days = buildHeatmap(dailyTrend);
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return (
    <div>
      <div style={{ display: "flex", gap: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginRight: 4, width: 24 }}>
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <span key={i} style={{ fontSize: 10, color: "var(--text-secondary)", height: 14, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{d}</span>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            {week.map((day, di) => (
              <div key={di} title={`${day.label}: ${day.count} complaints`}
                style={{ height: 14, borderRadius: 3, background: heatColor(day.count), cursor: "default", transition: "transform 0.1s" }}
                onMouseEnter={e => e.target.style.transform = "scale(1.3)"}
                onMouseLeave={e => e.target.style.transform = "scale(1)"} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, justifyContent: "flex-end" }}>
        <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>Less</span>
        {["var(--bg-secondary)","#bfdbfe","#60a5fa","#2563eb","#1e3a8a"].map(c => (
          <div key={c} style={{ width: 14, height: 14, borderRadius: 3, background: c }} />
        ))}
        <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>More</span>
      </div>
    </div>
  );
};

// ─── Priority Matrix ──────────────────────────────────────────────────────
const PriorityMatrix = ({ data = [] }) => {
  if (!data.length) return <p style={{ color: "var(--text-secondary)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>No data</p>;
  const ORDER = ["critical", "high", "medium", "low"];
  const sorted = [...data].sort((a, b) => ORDER.indexOf(a._id) - ORDER.indexOf(b._id));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {sorted.map((row) => {
        const pct = row.total > 0 ? Math.round((row.resolved / row.total) * 100) : 0;
        const breachPct = row.total > 0 ? Math.round((row.breached / row.total) * 100) : 0;
        const c = PRIORITY_COLOR[row._id] || PRIORITY_COLOR.medium;
        return (
          <div key={row._id} style={{ borderRadius: 12, border: "1px solid var(--border-color)", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.dot, flexShrink: 0, display: "inline-block" }} />
                <span style={{ fontSize: 13, fontWeight: 700, textTransform: "capitalize", color: "var(--text-primary)" }}>{row._id}</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 600, background: c.bg, color: c.text }}>{row.total} total</span>
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
                <span style={{ color: "#10b981", fontWeight: 700 }}>{pct}% resolved</span>
                <span style={{ color: "#ef4444", fontWeight: 700 }}>{breachPct}% breached</span>
              </div>
            </div>
            <div style={{ display: "flex", height: 8, borderRadius: 99, overflow: "hidden", background: "var(--bg-secondary)" }}>
              <div style={{ height: 8, background: "#10b981", width: `${pct}%`, transition: "width 0.7s ease" }} />
              <div style={{ height: 8, background: "#ef4444", width: `${breachPct}%`, transition: "width 0.7s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Resolution Table ─────────────────────────────────────────────────────
const ResolutionTable = ({ data = [] }) => {
  if (!data.length) return <p style={{ color: "var(--text-secondary)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>No resolved complaints yet</p>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
            {["Department","Avg Hours","Avg Days","Resolved"].map((h, i) => (
              <th key={h} style={{ textAlign: i === 0 ? "left" : "right", padding: "8px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const hrs = Math.round(row.avgResolutionHours || 0);
            const days = (hrs / 24).toFixed(1);
            const good = hrs < 48;
            return (
              <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--text-primary)" }}>{row._id || "Unassigned"}</td>
                <td style={{ padding: "10px 12px", textAlign: "right" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: good ? "#dcfce7" : "#fee2e2", color: good ? "#166534" : "#991b1b" }}>{hrs}h</span>
                </td>
                <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--text-secondary)", fontWeight: 500 }}>{days}d</td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "var(--text-primary)" }}>{row.totalResolved}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─── Department table ─────────────────────────────────────────────────────
const DeptReport = ({ data = [] }) => {
  if (!data.length) return <p style={{ color: "var(--text-secondary)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>No department data</p>;
  const maxT = Math.max(...data.map(d => d.total), 1);
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
            {["Department","Total","Pending","In Progress","Completed","Breached","Load"].map((h, i) => (
              <th key={h} style={{ textAlign: i === 0 ? "left" : "center", padding: "8px 8px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}>
              <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--text-primary)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d._id?.departmentName || "Unassigned"}</td>
              <td style={{ padding: "10px 8px", textAlign: "center", fontWeight: 700, color: "var(--text-primary)" }}>{d.total}</td>
              <td style={{ padding: "10px 8px", textAlign: "center", color: "#f59e0b", fontWeight: 600 }}>{d.pending}</td>
              <td style={{ padding: "10px 8px", textAlign: "center", color: "#3b82f6", fontWeight: 600 }}>{d.inProgress}</td>
              <td style={{ padding: "10px 8px", textAlign: "center", color: "#10b981", fontWeight: 600 }}>{d.completed}</td>
              <td style={{ padding: "10px 8px", textAlign: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 6, background: d.breached > 0 ? "#fee2e2" : "var(--bg-secondary)", color: d.breached > 0 ? "#991b1b" : "var(--text-secondary)" }}>{d.breached}</span>
              </td>
              <td style={{ padding: "10px 8px", width: 80 }}>
                <div style={{ background: "var(--bg-secondary)", borderRadius: 99, height: 6 }}>
                  <div style={{ height: 6, borderRadius: 99, background: "#3b82f6", width: `${(d.total / maxT) * 100}%` }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── SLA Panel ────────────────────────────────────────────────────────────
const SLAPanel = ({ slaBreakdown = [], kpis = {} }) => {
  const total = slaBreakdown.reduce((s, x) => s + x.count, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {["on_track","at_risk","breached"].map(key => {
          const item = slaBreakdown.find(x => x._id === key);
          const count = item?.count || 0;
          const c = SLA_COLOR[key];
          const pct = total ? Math.round((count / total) * 100) : 0;
          return (
            <div key={key} style={{ borderRadius: 12, padding: 16, textAlign: "center", background: c.bg }}>
              <p style={{ fontSize: 26, fontWeight: 800, color: c.text, margin: 0 }}>{count}</p>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "capitalize", marginTop: 4, color: c.text }}>{key.replace("_", " ")}</p>
              <p style={{ fontSize: 10, marginTop: 2, color: c.text, opacity: 0.7 }}>{pct}%</p>
            </div>
          );
        })}
      </div>
      <div style={{ borderRadius: 12, border: "1px solid var(--border-color)", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>SLA Compliance Rate</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: (kpis.slaCompliance || 0) >= 80 ? "#10b981" : "#ef4444" }}>
            {kpis.slaCompliance ?? "—"}%
          </span>
        </div>
        <div style={{ width: "100%", background: "var(--bg-secondary)", borderRadius: 99, height: 10, overflow: "hidden" }}>
          <div style={{ height: 10, borderRadius: 99, width: `${kpis.slaCompliance || 0}%`, background: (kpis.slaCompliance || 0) >= 80 ? "#22c55e" : "#ef4444", transition: "width 0.7s ease" }} />
        </div>
      </div>
    </div>
  );
};

// ─── Chart.js wrapper for bar/line/doughnut ───────────────────────────────
const ChartJSWidget = ({ id, type, data, options, height = 220 }) => {
  useEffect(() => {
    const existing = window.Chart?.getChart(id);
    if (existing) existing.destroy();
    const ctx = document.getElementById(id);
    if (!ctx || !window.Chart) return;
    new window.Chart(ctx, { type, data, options });
    return () => { window.Chart?.getChart(id)?.destroy(); };
  }, [id, JSON.stringify(data)]);

  return (
    <div style={{ position: "relative", width: "100%", height }}>
      <canvas id={id} role="img" aria-label={`${type} chart`} />
    </div>
  );
};

// ─── TABS ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview",   label: "Overview",    icon: "📊" },
  { id: "sla",        label: "SLA",         icon: "⏱" },
  { id: "priority",   label: "Priority",    icon: "🚨" },
  { id: "heatmap",    label: "Heatmap",     icon: "🗓" },
  { id: "department", label: "Departments", icon: "🏢" },
  { id: "resolution", label: "Resolution",  icon: "⚡" },
  { id: "geography",  label: "Geography",   icon: "📍" },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────
const Analytics = () => {
  const nav = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [chartReady, setChartReady] = useState(false);

  // Load Chart.js
  useEffect(() => {
    if (window.Chart) { setChartReady(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    s.onload = () => setChartReady(true);
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || (user.role !== "analyzer" && user.role !== "admin" && user.role !== "super_admin")) {
      nav("/"); return;
    }
    (async () => {
      setLoading(true);
      const res = await fetchComplaintAnalytics();
      if (res.success) setAnalytics(res.analytics || {});
      else setError(res.message || "Unable to load analytics.");
      setLoading(false);
    })();
  }, [nav]);

  const kpis = analytics?.kpis || {};

  const maxS = useMemo(() => Math.max(...(analytics?.statusBreakdown?.map(x => x.count) || [1])), [analytics]);
  const maxC = useMemo(() => Math.max(...(analytics?.categoryBreakdown?.map(x => x.count) || [1])), [analytics]);

  const monthlyData = useMemo(() => {
    const map = {};
    (analytics?.dailyTrend || []).forEach(({ _id, count }) => { const m = _id.slice(0, 7); map[m] = (map[m] || 0) + count; });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-9)
      .map(([month, count]) => ({
        label: new Date(month + "-01").toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        count,
      }));
  }, [analytics]);

  const weeklyData = analytics?.weeklyTrend || [];

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "4px solid var(--border-color)", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Loading analytics…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 20, padding: 48, textAlign: "center", maxWidth: 380 }}>
        <p style={{ fontSize: 36, marginBottom: 12 }}>⚠️</p>
        <p style={{ fontWeight: 600, color: "#ef4444" }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", paddingBottom: 60 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>

        {/* ── Hero banner ── */}
        <div style={{
          borderRadius: 24,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1d3461 100%)",
          color: "#fff",
          padding: "36px 40px",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 400, height: 400, background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#93c5fd", margin: "0 0 8px" }}>Analytics Hub</p>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Smart Insights & Reports</h1>
          <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 28px", maxWidth: 520 }}>Comprehensive complaint intelligence — SLA tracking, resolution metrics, department performance & geographic breakdown.</p>

          {/* Quick KPI strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[
              { label: "Total",       val: fmt(analytics?.totalComplaints), color: "rgba(255,255,255,0.08)" },
              { label: "Resolution",  val: `${kpis.resolutionRate ?? 0}%`, color: "rgba(16,185,129,0.2)" },
              { label: "SLA OK",      val: `${kpis.slaCompliance ?? 0}%`, color: "rgba(59,130,246,0.2)" },
              { label: "Last 7 Days", val: fmt(kpis.recentCount), color: "rgba(139,92,246,0.2)" },
            ].map(k => (
              <div key={k.label} style={{ background: k.color, borderRadius: 12, padding: "12px 16px", backdropFilter: "blur(4px)" }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)", margin: "0 0 4px" }}>{k.label}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 }}>{k.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 6, marginBottom: 24, overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 4, minWidth: "max-content" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "8px 16px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s",
                background: tab === t.id ? "#2563eb" : "transparent",
                color: tab === t.id ? "#fff" : "var(--text-secondary)",
                whiteSpace: "nowrap",
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══ OVERVIEW ══ */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* KPI cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <KPICard label="Total Complaints" value={fmt(analytics?.totalComplaints)} icon="📋" borderColor="#3b82f6" />
              <KPICard label="Resolution Rate" value={`${kpis.resolutionRate ?? 0}%`} sub={`${fmt(kpis.resolvedCount)} resolved`} icon="✅" borderColor="#10b981" />
              <KPICard label="SLA Compliance" value={`${kpis.slaCompliance ?? 0}%`} sub={`${fmt(kpis.slaBreachedCount)} breached`} icon="⏱" borderColor="#0ea5e9" />
              <KPICard label="Last 7 Days" value={fmt(kpis.recentCount)} sub="new complaints" icon="📅" borderColor="#8b5cf6" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <KPICard label="Pending" value={analytics?.statusBreakdown?.find(x=>x._id==="pending")?.count ?? 0} icon="🕐" borderColor="#f59e0b" />
              <KPICard label="In Progress" value={analytics?.statusBreakdown?.find(x=>x._id==="in_progress")?.count ?? 0} icon="🔧" borderColor="#3b82f6" />
              <KPICard label="Escalated" value={fmt(analytics?.escalationStats?.totalEscalated)} sub={`avg ${(analytics?.escalationStats?.avgEscalationCount || 0).toFixed(1)}x`} icon="🔺" borderColor="#ef4444" />
              <KPICard label="Departments" value={fmt(analytics?.departmentBreakdown?.length)} icon="🏢" borderColor="#14b8a6" />
            </div>

            {/* Charts row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card title="Monthly Volume (Last 9 Months)">
                {chartReady && monthlyData.length > 0 ? (
                  <ChartJSWidget
                    id="monthly-bar"
                    type="bar"
                    height={200}
                    data={{
                      labels: monthlyData.map(d => d.label),
                      datasets: [{
                        label: "Complaints",
                        data: monthlyData.map(d => d.count),
                        backgroundColor: "rgba(59,130,246,0.7)",
                        borderRadius: 6,
                        borderSkipped: false,
                      }],
                    }}
                    options={{
                      responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { x: { ticks: { autoSkip: false } }, y: { beginAtZero: true, grid: { color: "rgba(148,163,184,0.15)" } } }
                    }}
                  />
                ) : <p style={{ color: "var(--text-secondary)", fontSize: 13, textAlign: "center", padding: "40px 0" }}>Loading chart…</p>}
              </Card>

              <Card title="Priority Distribution">
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <Donut data={analytics?.priorityBreakdown || []} colors={PRIORITY_COLOR} size={120} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    {(analytics?.priorityBreakdown || []).map(p => {
                      const c = PRIORITY_COLOR[p._id] || PRIORITY_COLOR.medium;
                      const pct = analytics?.totalComplaints ? Math.round((p.count / analytics.totalComplaints) * 100) : 0;
                      return (
                        <div key={p._id}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                            <span style={{ textTransform: "capitalize", fontWeight: 600, color: c.text }}>{p._id}</span>
                            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{p.count} ({pct}%)</span>
                          </div>
                          <div style={{ background: "var(--bg-secondary)", borderRadius: 99, height: 6 }}>
                            <div style={{ height: 6, borderRadius: 99, background: c.bar, width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>

            {/* Status + Category */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card title="Status Breakdown">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(analytics?.statusBreakdown || []).map(item => (
                    <div key={item._id}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, textTransform: "capitalize", background: (STATUS_BAR[item._id] || "#94a3b8") + "20", color: STATUS_BAR[item._id] || "#64748b" }}>{item._id}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{item.count}</span>
                      </div>
                      <div style={{ background: "var(--bg-secondary)", borderRadius: 99, height: 6 }}>
                        <div style={{ height: 6, borderRadius: 99, background: STATUS_BAR[item._id] || "#94a3b8", width: `${(item.count / maxS) * 100}%`, transition: "width 0.7s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Top Categories">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(analytics?.categoryBreakdown || []).slice(0, 10).map(item => (
                    <HBar key={item._id} label={item._id || "Other"} count={item.count} max={maxC} color="#8b5cf6" />
                  ))}
                </div>
              </Card>
            </div>

            {/* Weekly sparkline */}
            <Card title="Weekly Volume Trend" subtitle="Last 12 weeks">
              {chartReady && weeklyData.length > 0 ? (
                <ChartJSWidget
                  id="weekly-line"
                  type="line"
                  height={180}
                  data={{
                    labels: weeklyData.map(w => `W${w._id?.week || ""}`),
                    datasets: [{
                      label: "Complaints",
                      data: weeklyData.map(w => w.count),
                      borderColor: "#3b82f6",
                      backgroundColor: "rgba(59,130,246,0.08)",
                      fill: true,
                      tension: 0.4,
                      pointRadius: 4,
                      pointBackgroundColor: "#3b82f6",
                    }],
                  }}
                  options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { color: "rgba(148,163,184,0.15)" } }, x: { grid: { display: false } } }
                  }}
                />
              ) : <p style={{ color: "var(--text-secondary)", fontSize: 13, textAlign: "center", padding: "40px 0" }}>No weekly data</p>}
            </Card>
          </div>
        )}

        {/* ══ SLA ══ */}
        {tab === "sla" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card title="SLA Status Overview">
                <SLAPanel slaBreakdown={analytics?.slaBreakdown || []} kpis={kpis} />
              </Card>
              <Card title="SLA Breakdown">
                {chartReady && (analytics?.slaBreakdown || []).length > 0 ? (
                  <ChartJSWidget
                    id="sla-doughnut"
                    type="doughnut"
                    height={220}
                    data={{
                      labels: (analytics?.slaBreakdown || []).map(x => x._id?.replace("_"," ")),
                      datasets: [{
                        data: (analytics?.slaBreakdown || []).map(x => x.count),
                        backgroundColor: (analytics?.slaBreakdown || []).map(x => SLA_COLOR[x._id]?.bar || "#94a3b8"),
                        borderWidth: 2,
                        borderColor: "#fff",
                      }],
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } }, cutout: "60%" }}
                  />
                ) : <p style={{ color: "var(--text-secondary)", fontSize: 13, textAlign: "center", padding: "40px 0" }}>No data</p>}
              </Card>
            </div>

            {/* Escalation */}
            <Card title="Escalation Statistics">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                {[
                  { label: "Total Escalated", val: fmt(analytics?.escalationStats?.totalEscalated) },
                  { label: "Avg Escalations", val: (analytics?.escalationStats?.avgEscalationCount || 0).toFixed(2) },
                  { label: "Max Escalations", val: fmt(analytics?.escalationStats?.maxEscalations) },
                ].map(s => (
                  <div key={s.label} style={{ borderRadius: 12, background: "#fee2e2", border: "1px solid #fecaca", padding: 20, textAlign: "center" }}>
                    <p style={{ fontSize: 28, fontWeight: 800, color: "#991b1b", margin: 0 }}>{s.val}</p>
                    <p style={{ fontSize: 12, color: "#b91c1c", fontWeight: 600, marginTop: 6 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ══ PRIORITY ══ */}
        {tab === "priority" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card title="Priority vs Resolution Matrix">
              <PriorityMatrix data={analytics?.priorityVsResolution || []} />
            </Card>
            <Card title="Priority Distribution">
              {chartReady && (analytics?.priorityBreakdown || []).length > 0 ? (
                <>
                  <ChartJSWidget
                    id="priority-bar"
                    type="bar"
                    height={200}
                    data={{
                      labels: (analytics?.priorityBreakdown || []).map(p => p._id),
                      datasets: [{
                        label: "Count",
                        data: (analytics?.priorityBreakdown || []).map(p => p.count),
                        backgroundColor: (analytics?.priorityBreakdown || []).map(p => PRIORITY_COLOR[p._id]?.bar || "#94a3b8"),
                        borderRadius: 8,
                        borderSkipped: false,
                      }],
                    }}
                    options={{
                      responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, grid: { color: "rgba(148,163,184,0.15)" } }, x: { grid: { display: false } } }
                    }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                    {(analytics?.priorityBreakdown || []).map(p => {
                      const c = PRIORITY_COLOR[p._id] || PRIORITY_COLOR.medium;
                      const pct = analytics?.totalComplaints ? Math.round((p.count / analytics.totalComplaints) * 100) : 0;
                      return (
                        <div key={p._id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.dot, flexShrink: 0, display: "inline-block" }} />
                          <span style={{ flex: 1, fontSize: 12, textTransform: "capitalize", color: "var(--text-primary)", fontWeight: 600 }}>{p._id}</span>
                          <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 99, background: c.bg, color: c.text, fontWeight: 700 }}>{p.count} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : <p style={{ color: "var(--text-secondary)", fontSize: 13, textAlign: "center", padding: "40px 0" }}>No data</p>}
            </Card>
          </div>
        )}

        {/* ══ HEATMAP ══ */}
        {tab === "heatmap" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Card title="Activity Heatmap (Last 90 Days)" subtitle="Each cell = 1 day. Darker = more complaints.">
              <Heatmap dailyTrend={analytics?.dailyTrend || []} />

              {/* Recent 30 days tiles */}
              <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 8 }}>
                {[...(analytics?.dailyTrend || [])].reverse().slice(0, 30).map(row => (
                  <div key={row._id} style={{ borderRadius: 8, border: "1px solid var(--border-color)", padding: "8px 4px", textAlign: "center", background: "var(--bg-secondary)" }}>
                    <p style={{ fontSize: 9, color: "var(--text-secondary)", lineHeight: 1.4, margin: 0 }}>{row._id?.slice(5)}</p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: "#2563eb", margin: 0 }}>{row.count}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ══ DEPARTMENTS ══ */}
        {tab === "department" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Card title="Department Performance Report">
              <DeptReport data={analytics?.departmentBreakdown || []} />
            </Card>
            <Card title="Department Load Distribution">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(analytics?.departmentBreakdown || []).map((d, i) => (
                  <HBar key={i}
                    label={d._id?.departmentName || "Unassigned"}
                    count={d.total}
                    max={Math.max(...(analytics?.departmentBreakdown || []).map(x => x.total), 1)}
                    color="#3b82f6" />
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ══ RESOLUTION ══ */}
        {tab === "resolution" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Card title="Average Resolution Time by Department" subtitle="Green = under 48h · Red = over 48h">
              <ResolutionTable data={analytics?.resolutionTimeStats || []} />
            </Card>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card title="Resolution Hours (Top 8 Depts)">
                {chartReady && (analytics?.resolutionTimeStats || []).length > 0 ? (
                  <ChartJSWidget
                    id="resolution-bar"
                    type="bar"
                    height={200}
                    data={{
                      labels: (analytics?.resolutionTimeStats || []).slice(0, 8).map(r => (r._id || "—").slice(0, 12)),
                      datasets: [{
                        label: "Avg Hours",
                        data: (analytics?.resolutionTimeStats || []).slice(0, 8).map(r => Math.round(r.avgResolutionHours || 0)),
                        backgroundColor: (analytics?.resolutionTimeStats || []).slice(0, 8).map(r => Math.round(r.avgResolutionHours || 0) < 48 ? "rgba(16,185,129,0.7)" : "rgba(239,68,68,0.7)"),
                        borderRadius: 6,
                        borderSkipped: false,
                      }],
                    }}
                    options={{
                      responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, grid: { color: "rgba(148,163,184,0.15)" } }, x: { ticks: { maxRotation: 45, autoSkip: false } } }
                    }}
                  />
                ) : <p style={{ color: "var(--text-secondary)", fontSize: 13, textAlign: "center", padding: "40px 0" }}>No data</p>}
              </Card>
              <Card title="Weekly Volume Trend">
                {chartReady && weeklyData.length > 0 ? (
                  <ChartJSWidget
                    id="resolution-weekly"
                    type="line"
                    height={200}
                    data={{
                      labels: weeklyData.map(w => `W${w._id?.week || ""}`),
                      datasets: [{
                        label: "Complaints",
                        data: weeklyData.map(w => w.count),
                        borderColor: "#8b5cf6",
                        backgroundColor: "rgba(139,92,246,0.08)",
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: "#8b5cf6",
                      }],
                    }}
                    options={{
                      responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, grid: { color: "rgba(148,163,184,0.15)" } }, x: { grid: { display: false } } }
                    }}
                  />
                ) : <p style={{ color: "var(--text-secondary)", fontSize: 13, textAlign: "center", padding: "40px 0" }}>No weekly data</p>}
              </Card>
            </div>
          </div>
        )}

        {/* ══ GEOGRAPHY ══ */}
        {tab === "geography" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card title="By Taluka">
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
                {(analytics?.talukaBreakdown || []).slice(0, 20).map((item, i) => (
                  <HBar key={i}
                    label={item._id?.taluka || item._id || "—"}
                    sub={item._id?.district}
                    count={item.count}
                    max={Math.max(...(analytics?.talukaBreakdown || []).map(d => d.count), 1)}
                    color="#8b5cf6" />
                ))}
              </div>
            </Card>

            <Card title="City / District Breakdown">
              <div style={{ overflowX: "auto", maxHeight: 320, overflowY: "auto" }}>
                <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                      {["City","District","Count"].map((h, i) => (
                        <th key={h} style={{ padding: "8px 8px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", textAlign: i === 2 ? "right" : "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics?.locationBreakdown || []).slice(0, 25).map((item, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "8px", fontWeight: 600, color: "var(--text-primary)" }}>{item._id?.city || "—"}</td>
                        <td style={{ padding: "8px", color: "var(--text-secondary)", fontSize: 12 }}>{item._id?.district || "—"}</td>
                        <td style={{ padding: "8px", textAlign: "right", fontWeight: 700, color: "var(--text-primary)" }}>{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Top locations chart */}
            <Card title="Top 8 Talukas by Volume" style={{ gridColumn: "1 / -1" }}>
              {chartReady && (analytics?.talukaBreakdown || []).length > 0 ? (
                <ChartJSWidget
                  id="geo-bar"
                  type="bar"
                  height={220}
                  data={{
                    labels: (analytics?.talukaBreakdown || []).slice(0, 8).map(x => x._id?.taluka || x._id || "—"),
                    datasets: [{
                      label: "Complaints",
                      data: (analytics?.talukaBreakdown || []).slice(0, 8).map(x => x.count),
                      backgroundColor: CHART_COLORS,
                      borderRadius: 8,
                      borderSkipped: false,
                    }],
                  }}
                  options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { color: "rgba(148,163,184,0.15)" } }, x: { grid: { display: false } } }
                  }}
                />
              ) : <p style={{ color: "var(--text-secondary)", fontSize: 13, textAlign: "center", padding: "40px 0" }}>No taluka data</p>}
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};

export default Analytics;