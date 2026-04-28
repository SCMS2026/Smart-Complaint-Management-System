import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchComplaintAnalytics } from "../services/complaints";

const STATUS_COLOR = {
  pending:               { bg: "bg-amber-100",   text: "text-amber-700",   bar: "#f59e0b" },
  verified:              { bg: "bg-sky-100",      text: "text-sky-700",     bar: "#0ea5e9" },
  assigned:              { bg: "bg-violet-100",   text: "text-violet-700",  bar: "#8b5cf6" },
  in_progress:           { bg: "bg-blue-100",     text: "text-blue-700",    bar: "#3b82f6" },
  completed:             { bg: "bg-emerald-100",  text: "text-emerald-700", bar: "#10b981" },
  approved_by_user:      { bg: "bg-green-100",    text: "text-green-700",   bar: "#22c55e" },
  rejected:              { bg: "bg-red-100",      text: "text-red-700",     bar: "#ef4444" },
  rejected_by_user:      { bg: "bg-rose-100",     text: "text-rose-700",    bar: "#f43f5e" },
  user_approval_pending: { bg: "bg-orange-100",   text: "text-orange-700",  bar: "#f97316" },
};
const statusColor = (s) => STATUS_COLOR[s] || { bg: "bg-slate-100", text: "text-slate-600", bar: "#94a3b8" };

const buildHeatmap = (dailyTrend = []) => {
  const map = {};
  dailyTrend.forEach(({ _id, count }) => { map[_id] = count; });
  const today = new Date();
  const days = [];
  for (let i = 69; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: map[key] || 0, label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) });
  }
  return days;
};

const heatColor = (count) => {
  if (count === 0) return "#f1f5f9";
  if (count <= 2)  return "#bfdbfe";
  if (count <= 5)  return "#60a5fa";
  if (count <= 10) return "#2563eb";
  return "#1e3a8a";
};

const StatCard = ({ label, value, accent }) => (
  <div className={`rounded-2xl border-l-4 bg-white p-5 shadow-sm ${accent}`}>
    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
    <p className="text-3xl font-black text-slate-900 mt-1">{value ?? "—"}</p>
  </div>
);

const HBar = ({ label, count, max, color }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="w-36 truncate text-slate-600 text-right text-xs">{label || "Unknown"}</span>
    <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
      <div className="h-2.5 rounded-full" style={{ width: `${max ? (count/max)*100 : 0}%`, background: color, transition:"width .6s" }} />
    </div>
    <span className="w-8 text-right font-bold text-slate-700 text-xs">{count}</span>
  </div>
);

const MonthlyChart = ({ dailyTrend = [] }) => {
  const monthly = useMemo(() => {
    const map = {};
    dailyTrend.forEach(({ _id, count }) => { const m = _id.slice(0,7); map[m] = (map[m]||0)+count; });
    return Object.entries(map).sort(([a],[b])=>a.localeCompare(b)).slice(-6)
      .map(([month, count]) => ({ label: new Date(month+"-01").toLocaleDateString("en-IN",{month:"short",year:"2-digit"}), count }));
  }, [dailyTrend]);

  if (!monthly.length) return <p className="text-slate-400 text-sm text-center py-8">No monthly data</p>;
  const max = Math.max(...monthly.map(m=>m.count),1);
  const W=480, H=160, pad=24, barW=44, gap=(W-pad*2-barW*monthly.length)/(monthly.length-1||1);

  return (
    <svg viewBox={`0 0 ${W} ${H+36}`} className="w-full">
      {monthly.map((m,i) => {
        const bH = Math.max(4,((m.count/max)*(H-pad)));
        const x = pad+i*(barW+gap), y = H-bH;
        return (
          <g key={m.label}>
            <rect x={x} y={y} width={barW} height={bH} rx="6" fill="#3b82f6" opacity=".85"/>
            <text x={x+barW/2} y={y-5} textAnchor="middle" fontSize="11" fill="#1e40af" fontWeight="700">{m.count}</text>
            <text x={x+barW/2} y={H+18} textAnchor="middle" fontSize="10" fill="#94a3b8">{m.label}</text>
          </g>
        );
      })}
      <line x1={pad} y1={H} x2={W-pad} y2={H} stroke="#e2e8f0" strokeWidth="1"/>
    </svg>
  );
};

const Heatmap = ({ dailyTrend }) => {
  const days = buildHeatmap(dailyTrend);
  const weeks = [];
  for (let i=0; i<days.length; i+=7) weeks.push(days.slice(i,i+7));
  const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return (
    <div>
      <div className="flex gap-1 mb-1 ml-8">
        {weeks.map((w,wi) => (
          <span key={wi} className="text-[10px] text-slate-400 flex-1 text-center">
            {wi%2===0 ? w[0]?.label?.slice(0,6) : ""}
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 mr-1 w-8">
          {DAY_LABELS.map(d=>(
            <span key={d} className="text-[10px] text-slate-400 h-4 flex items-center justify-end pr-1">{d}</span>
          ))}
        </div>
        {weeks.map((week,wi)=>(
          <div key={wi} className="flex flex-col gap-1 flex-1">
            {week.map((day,di)=>(
              <div key={di} title={`${day.label}: ${day.count}`}
                className="h-4 rounded-sm cursor-default hover:scale-125 transition-transform"
                style={{background:heatColor(day.count)}}/>
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10px] text-slate-400">Less</span>
        {["#f1f5f9","#bfdbfe","#60a5fa","#2563eb","#1e3a8a"].map(c=>(
          <div key={c} className="w-4 h-4 rounded-sm" style={{background:c}}/>
        ))}
        <span className="text-[10px] text-slate-400">More</span>
      </div>
    </div>
  );
};

const DepartmentReport = ({ departmentBreakdown = [] }) => {
  if (!departmentBreakdown.length) return <p className="text-slate-400 text-sm text-center py-8">No department data available</p>;
  const maxTotal = Math.max(...departmentBreakdown.map(d=>d.total),1);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {["Department","Total","Pending","In Progress","Completed","Load"].map(h=>(
              <th key={h} className={`py-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-400 ${h==="Department"?"text-left":"text-center"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {departmentBreakdown.map((dept,i)=>(
            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="py-3 px-3 font-semibold text-slate-800">{dept._id?.departmentName||"Unassigned"}</td>
              <td className="py-3 px-3 text-center font-bold text-slate-700">{dept.total}</td>
              <td className="py-3 px-3 text-center text-amber-600 font-medium">{dept.pending}</td>
              <td className="py-3 px-3 text-center text-blue-600 font-medium">{dept.inProgress}</td>
              <td className="py-3 px-3 text-center text-emerald-600 font-medium">{dept.completed}</td>
              <td className="py-3 px-3 w-32">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full bg-blue-500" style={{width:`${(dept.total/maxTotal)*100}%`}}/>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AnalyzerDashboard = () => {
  const nav = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")||"null");
    if (!user || user.role !== "analyzer") { nav("/"); return; }
    (async () => {
      setLoading(true);
      const res = await fetchComplaintAnalytics();
      if (res.success) setAnalytics(res.analytics||{});
      else setError(res.message||"Unable to load analytics.");
      setLoading(false);
    })();
  }, [nav]);

  const totalResolved = () => (analytics?.statusBreakdown||[]).reduce((s,x)=>{
    return ["completed","approved_by_user","resolved"].includes(x._id) ? s+x.count : s;
  },0);
  const sv = (s) => analytics?.statusBreakdown?.find(x=>x._id===s)?.count||0;
  const maxS = useMemo(()=>Math.max(...(analytics?.statusBreakdown?.map(x=>x.count)||[1])),[analytics]);
  const maxC = useMemo(()=>Math.max(...(analytics?.categoryBreakdown?.map(x=>x.count)||[1])),[analytics]);

  const TABS = [
    {id:"overview",  label:"📊 Overview"},
    {id:"heatmap",   label:"🗓 Heatmap"},
    {id:"department",label:"🏢 Department"},
    {id:"monthly",   label:"📈 Monthly"},
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Hero */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white p-8 sm:p-10 shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle at 70% 30%, #3b82f6 0%, transparent 60%)"}}/>
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-blue-300 mb-2">Analytics Workspace</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Analyzer Dashboard</h1>
          <p className="mt-2 text-slate-300 text-sm max-w-xl">Real-time complaint data — heatmaps, department breakdowns, monthly trends.</p>
        </div>

        {/* Stat Cards */}
        {!loading && !error && analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total"       value={analytics.totalComplaints} accent="border-l-blue-500"/>
            <StatCard label="Pending"     value={sv("pending")}             accent="border-l-amber-400"/>
            <StatCard label="In Progress" value={sv("in_progress")}         accent="border-l-blue-400"/>
            <StatCard label="Resolved"    value={totalResolved()}           accent="border-l-emerald-500"/>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1 mb-6 overflow-x-auto shadow-sm">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex-1 min-w-max px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab===t.id ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="rounded-3xl bg-white p-16 shadow-sm text-center">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"/>
            <p className="text-slate-400 text-sm">Loading analytics…</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-white p-12 shadow-sm text-center text-red-500">{error}</div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab==="overview" && (
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                  <h2 className="text-base font-bold text-slate-800 mb-4">Status Breakdown</h2>
                  <div className="space-y-3">
                    {(analytics?.statusBreakdown||[]).map(item=>{
                      const {bg,text,bar} = statusColor(item._id);
                      return (
                        <div key={item._id}>
                          <div className="flex justify-between mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bg} ${text}`}>{item._id||"unknown"}</span>
                            <span className="text-sm font-bold text-slate-700">{item.count}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="h-2 rounded-full" style={{width:`${(item.count/maxS)*100}%`,background:bar,transition:"width .6s"}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                  <h2 className="text-base font-bold text-slate-800 mb-4">Top Categories</h2>
                  <div className="space-y-3">
                    {(analytics?.categoryBreakdown||[]).slice(0,10).map(item=>(
                      <HBar key={item._id} label={item._id||"Other"} count={item.count} max={maxC} color="#8b5cf6"/>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 xl:col-span-2">
                  <h2 className="text-base font-bold text-slate-800 mb-4">Location Breakdown</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left py-2 px-3 text-slate-400 text-xs uppercase tracking-wider font-semibold">City</th>
                          <th className="text-left py-2 px-3 text-slate-400 text-xs uppercase tracking-wider font-semibold">District</th>
                          <th className="text-right py-2 px-3 text-slate-400 text-xs uppercase tracking-wider font-semibold">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(analytics?.locationBreakdown||[]).slice(0,15).map((item,i)=>(
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="py-2 px-3 font-medium text-slate-700">{item._id?.city||"—"}</td>
                            <td className="py-2 px-3 text-slate-500">{item._id?.district||"—"}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-800">{item.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* HEATMAP */}
            {tab==="heatmap" && (
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                <h2 className="text-base font-bold text-slate-800 mb-1">Activity Heatmap</h2>
                <p className="text-xs text-slate-400 mb-6">Last 10 weeks — each cell = 1 day. Darker = more complaints.</p>
                <Heatmap dailyTrend={analytics?.dailyTrend||[]}/>
                <div className="mt-8">
                  <h3 className="text-sm font-bold text-slate-600 mb-3">Daily Trend (Last 30 Days)</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
                    {[...(analytics?.dailyTrend||[])].reverse().slice(0,30).map(row=>(
                      <div key={row._id} className="rounded-xl border border-slate-100 p-2 text-center bg-slate-50">
                        <p className="text-[10px] text-slate-400">{row._id}</p>
                        <p className="text-lg font-black text-blue-600">{row.count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DEPARTMENT */}
            {tab==="department" && (
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                <h2 className="text-base font-bold text-slate-800 mb-1">Department Report</h2>
                <p className="text-xs text-slate-400 mb-6">Complaints split by department — pending, in-progress, completed.</p>
                <DepartmentReport departmentBreakdown={analytics?.departmentBreakdown||[]}/>
                {(analytics?.departmentBreakdown||[]).length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-bold text-slate-600 mb-4">Department Load Chart</h3>
                    <div className="space-y-3">
                      {analytics.departmentBreakdown.map((dept,i)=>(
                        <HBar key={i} label={dept._id?.departmentName||"Unassigned"} count={dept.total}
                          max={Math.max(...analytics.departmentBreakdown.map(d=>d.total),1)} color="#3b82f6"/>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MONTHLY */}
            {tab==="monthly" && (
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                <h2 className="text-base font-bold text-slate-800 mb-1">Monthly Trend</h2>
                <p className="text-xs text-slate-400 mb-6">Last 6 months — total complaints per month.</p>
                <MonthlyChart dailyTrend={analytics?.dailyTrend||[]}/>
                <div className="mt-8">
                  <h3 className="text-sm font-bold text-slate-600 mb-3">Monthly Summary Table</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left py-2 px-3 text-slate-400 text-xs uppercase tracking-wider font-semibold">Month</th>
                          <th className="text-right py-2 px-3 text-slate-400 text-xs uppercase tracking-wider font-semibold">Complaints</th>
                          <th className="py-2 px-3 text-slate-400 text-xs uppercase tracking-wider font-semibold w-48">Bar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(()=>{
                          const map={};
                          (analytics?.dailyTrend||[]).forEach(({_id,count})=>{const m=_id.slice(0,7);map[m]=(map[m]||0)+count;});
                          const entries = Object.entries(map).sort(([a],[b])=>a.localeCompare(b));
                          const maxM = Math.max(...entries.map(([,v])=>v),1);
                          return entries.map(([month,count])=>(
                            <tr key={month} className="border-b border-slate-50 hover:bg-slate-50">
                              <td className="py-2 px-3 font-medium text-slate-700">
                                {new Date(month+"-01").toLocaleDateString("en-IN",{month:"long",year:"numeric"})}
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-blue-600">{count}</td>
                              <td className="py-2 px-3">
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                  <div className="h-2 rounded-full bg-blue-500" style={{width:`${(count/maxM)*100}%`}}/>
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
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyzerDashboard;