import { useState, useRef, useCallback } from "react";
import { searchComplaintsPublic } from "../services/complaints";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  low:      { color: "#0EA5E9", bg: "#E0F2FE", label: "Low",      icon: "↓" },
  medium:   { color: "#F59E0B", bg: "#FEF3C7", label: "Medium",   icon: "―" },
  high:     { color: "#EF4444", bg: "#FEE2E2", label: "High",     icon: "↑" },
  critical: { color: "#DB2777", bg: "#FCE7F3", label: "Critical", icon: "!!" },
};

const SLA_CONFIG = {
  on_track: { color: "#10B981", label: "On Track" },
  at_risk:  { color: "#F59E0B", label: "At Risk"  },
  breached: { color: "#EF4444", label: "Breached" },
};

const STATUS_ORDER = [
  "pending","verified","assigned","in_progress",
  "user_approval_pending","completed","approved_by_user",
];

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }) : "—";

const isRejected = (s) => s === "rejected" || s === "rejected_by_user";

// ─── Timeline Step ─────────────────────────────────────────────────────────────

function TimelineStep({ step, index, total, isDark }) {
  const isLast = index === total - 1;
  return (
    <div style={{ display: "flex", gap: 16, position: "relative" }}>
      {!isLast && (
        <div style={{
          position: "absolute", left: 17, top: 36,
          width: 2, height: "calc(100% + 4px)",
          background: step.done
            ? "linear-gradient(180deg,#2563EB,#60A5FA)"
            : isDark ? "#334155" : "#E2E8F0",
        }} />
      )}
      <div style={{ flexShrink: 0, zIndex: 1 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 14,
          background: step.active
            ? "linear-gradient(135deg,#1E3A5F,#2563EB)"
            : step.done ? "#2563EB"
            : isDark ? "#1E293B" : "#F1F5F9",
          color: step.done || step.active ? "#fff" : isDark ? "#64748B" : "#CBD5E1",
          border: step.active ? "3px solid #60A5FA"
            : step.done ? "2px solid #2563EB"
            : `2px solid ${isDark ? "#334155" : "#E2E8F0"}`,
          boxShadow: step.active ? "0 0 0 4px rgba(37,99,235,0.2)" : "none",
        }}>
          {step.done && !step.active ? "✓" : index + 1}
        </div>
      </div>
      <div style={{ paddingTop: 6, paddingBottom: 24 }}>
        <p style={{
          margin: 0, fontWeight: step.active ? 700 : 500, fontSize: 14,
          color: step.active ? "#2563EB"
            : step.done ? isDark ? "#94A3B8" : "#64748B"
            : isDark ? "#475569" : "#CBD5E1",
        }}>
          {step.label}
          {step.active && (
            <span style={{
              marginLeft: 8,
              background: "linear-gradient(135deg,#1E3A5F,#2563EB)",
              color: "#fff", fontSize: 10, fontWeight: 700,
              padding: "2px 8px", borderRadius: 20,
            }}>CURRENT</span>
          )}
        </p>
      </div>
    </div>
  );
}

// ─── Result Card ───────────────────────────────────────────────────────────────

function ComplaintCard({ complaint, isDark, theme, onSelect, isSelected }) {
  const priority = PRIORITY_CONFIG[complaint.priority] || PRIORITY_CONFIG.medium;
  const rejected = isRejected(complaint.status);

  return (
    <div
      onClick={() => onSelect(complaint)}
      style={{
        background: isSelected
          ? isDark ? "#1E3A5F" : "#EFF6FF"
          : theme.card,
        border: `1.5px solid ${isSelected ? "#2563EB" : theme.border}`,
        borderRadius: 12, padding: "16px 20px",
        cursor: "pointer", transition: "all 0.2s",
        boxShadow: isSelected ? "0 0 0 3px rgba(37,99,235,0.15)" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: theme.text }}>{complaint.issue}</p>
          <p style={{ margin: 0, fontSize: 12, color: theme.sub }}>
            👤 {complaint.complainantName} &nbsp;·&nbsp; 📍 {complaint.location}
          </p>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span style={{
            background: priority.bg, color: priority.color,
            padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
          }}>{priority.icon} {priority.label}</span>
          <span style={{
            background: rejected ? "#FEE2E2" : isDark ? "#1E293B" : "#F1F5F9",
            color: rejected ? "#DC2626" : theme.sub,
            padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
            border: `1px solid ${theme.border}`,
          }}>{complaint.status.replace(/_/g, " ")}</span>
        </div>
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 11, color: theme.sub }}>
        🏢 {complaint.department} &nbsp;·&nbsp; 🕐 {fmtDate(complaint.submittedAt)}
      </p>
    </div>
  );
}

// ─── Detail Panel ──────────────────────────────────────────────────────────────

function ComplaintDetail({ complaint, isDark, theme, onClose }) {
  const priority = PRIORITY_CONFIG[complaint.priority] || PRIORITY_CONFIG.medium;
  const sla = SLA_CONFIG[complaint.slaStatus] || SLA_CONFIG.on_track;
  const rejected = isRejected(complaint.status);

  return (
    <div style={{
      background: theme.card, border: `1px solid ${theme.border}`,
      borderRadius: 16, padding: 24,
      boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: theme.sub, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            #{complaint.id?.slice(-8).toUpperCase()}
          </p>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: theme.text }}>{complaint.issue}</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: theme.sub }}>Submitted by {complaint.complainantName}</p>
        </div>
        <button onClick={onClose} style={{
          background: "transparent", border: "none",
          color: theme.sub, fontSize: 18, cursor: "pointer", padding: 4,
        }}>✕</button>
      </div>

      {/* Badges */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <span style={{ background: priority.bg, color: priority.color, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
          {priority.icon} {priority.label} Priority
        </span>
        {complaint.slaDeadline && (
          <span style={{ background: isDark ? "#1E293B" : "#F1F5F9", color: sla.color, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: `1px solid ${sla.color}44` }}>
            SLA: {sla.label}
          </span>
        )}
        {complaint.escalated && (
          <span style={{ background: "#FEF3C7", color: "#D97706", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
            🔺 Escalated
          </span>
        )}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[
          ["Category",     complaint.category],
          ["Location",     complaint.location],
          ["Department",   complaint.department],
          ["Assigned To",  complaint.assignedWorker],
          ["Submitted",    fmtDate(complaint.submittedAt)],
          ["Last Updated", fmtDate(complaint.lastUpdated)],
          ...(complaint.slaDeadline ? [["SLA Deadline", fmtDate(complaint.slaDeadline)]] : []),
        ].map(([label, value]) => (
          <div key={label} className="pb-3 border-b" style={{ borderColor: isDark ? "#1E293B" : "#F1F5F9" }}>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.07em]" style={{ color: theme.sub }}>{label}</p>
            <p className="m-0 text-sm font-medium" style={{ color: theme.text }}>{value || "—"}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <h3 style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 700, color: theme.text }}>Progress Timeline</h3>
      {rejected ? (
        <div style={{ background: isDark ? "#450a0a" : "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: 14, color: "#991B1B", fontWeight: 600, fontSize: 13 }}>
          ❌ This complaint was {complaint.status === "rejected_by_user" ? "rejected by the user" : "rejected by admin"}.
        </div>
      ) : (
        complaint.timeline.map((step, i) => (
          <TimelineStep key={step.status} step={step} index={i} total={complaint.timeline.length} isDark={isDark} />
        ))
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ComplaintTracking() {
  const [query, setQuery]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [results, setResults]       = useState(null);
  const [error, setError]           = useState("");
  const [selected, setSelected]     = useState(null);
  const debounceRef                 = useRef(null);

  const isDark = typeof window !== "undefined" &&
    (localStorage.getItem("theme") === "dark" ||
      document.documentElement.classList.contains("dark"));

  const theme = {
    bg:     isDark ? "#0F172A" : "#F8FAFC",
    card:   isDark ? "#1E293B" : "#FFFFFF",
    border: isDark ? "#334155" : "#E2E8F0",
    text:   isDark ? "#F1F5F9" : "#0F172A",
    sub:    isDark ? "#94A3B8" : "#64748B",
    input:  isDark ? "#0F172A" : "#FFFFFF",
  };

  const doSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setResults(null);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    setSelected(null);
    const res = await searchComplaintsPublic(q.trim());
    setLoading(false);
    if (res.success) {
      setResults(res.results);
      if (res.results.length === 0) setError("No complaints found matching your search.");
    } else {
      setError(res.message || "Search failed.");
      setResults(null);
    }
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      clearTimeout(debounceRef.current);
      doSearch(query);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-10" style={{ background: theme.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="relative overflow-hidden rounded-[20px] p-6 sm:p-8 mb-7 shadow-[0_8px_32px_rgba(37,99,235,0.3)]" style={{ background: "linear-gradient(135deg,#1E3A5F,#2563EB)" }}>
          <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/5" />
          <p className="m-0 text-xs sm:text-sm font-bold uppercase tracking-[0.12em] text-sky-300">
            Smart Complaint System
          </p>
          <h1 className="mt-2 mb-2 text-2xl sm:text-3xl font-bold text-white">
            Track Your Complaint
          </h1>
          <p className="text-sm sm:text-base text-sky-200">
            Search by your name, issue type, or location to find your complaint
          </p>
        </div>

        {/* Search Box */}
        <div className="rounded-[20px] border p-5 sm:p-6 mb-6 shadow-sm" style={{ background: theme.card, borderColor: theme.border }}>
          <label className="block text-xs sm:text-sm font-bold uppercase tracking-[0.06em] mb-2" style={{ color: theme.sub }}>
            Search Complaints
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Enter your name, issue (e.g. pothole, water leak) or location..."
              className="min-w-0 flex-1 rounded-[14px] border px-4 py-3 text-sm sm:text-base transition-all outline-none"
              style={{
                borderColor: theme.border,
                background: theme.input,
                color: theme.text,
              }}
              onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
              onBlur={(e) => (e.target.style.borderColor = theme.border)}
            />
            <button
              onClick={() => { clearTimeout(debounceRef.current); doSearch(query); }}
              disabled={loading || query.trim().length < 2}
              className="rounded-[14px] px-4 py-3 text-sm sm:text-base font-semibold transition-all whitespace-nowrap"
              style={{
                background: loading || query.trim().length < 2
                  ? isDark ? "#1E293B" : "#E2E8F0"
                  : "linear-gradient(135deg,#1E3A5F,#2563EB)",
                color: loading || query.trim().length < 2 ? theme.sub : "#fff",
                cursor: loading || query.trim().length < 2 ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span style={{
                    width: 14, height: 14, border: "2px solid #94A3B8",
                    borderTopColor: "#2563EB", borderRadius: "50%",
                    display: "inline-block", animation: "spin 0.7s linear infinite",
                  }} />
                  Searching…
                </span>
              ) : "Search →"}
            </button>
          </div>
          <p className="mt-3 text-xs sm:text-sm" style={{ color: theme.sub }}>
            💡 Try: your name · "water leak" · "Surat" · "pothole"
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "14px 18px", color: "#991B1B", fontSize: 14, marginBottom: 20 }}>
            ⚠ {error}
          </div>
        )}

        {/* Results + Detail side-by-side on wide, stacked on narrow */}
        {results && results.length > 0 && (
          <div className="flex flex-col gap-4">

            {/* Result count */}
            <p className="m-0 text-sm sm:text-base font-medium" style={{ color: theme.sub }}>
              {results.length} complaint{results.length !== 1 ? "s" : ""} found
            </p>

            <div className={`grid gap-4 ${selected ? "lg:grid-cols-[1fr_1.4fr]" : "grid-cols-1"}`}>

              {/* List */}
              <div className="flex flex-col gap-3">
                {results.map((c) => (
                  <ComplaintCard
                    key={c.id}
                    complaint={c}
                    isDark={isDark}
                    theme={theme}
                    isSelected={selected?.id === c.id}
                    onSelect={setSelected}
                  />
                ))}
              </div>

              {/* Detail panel */}
              {selected && (
                <ComplaintDetail
                  complaint={selected}
                  isDark={isDark}
                  theme={theme}
                  onClose={() => setSelected(null)}
                />
              )}
            </div>

            {/* New search */}
            <button
              onClick={() => { setResults(null); setQuery(""); setSelected(null); setError(""); }}
              className="mx-auto rounded-[14px] border px-5 py-3 text-sm font-semibold transition-all"
              style={{
                borderColor: theme.border,
                color: theme.sub,
                background: "transparent",
              }}
            >
              ← New Search
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}