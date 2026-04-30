import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─── Icons ────────────────────────────────────────────────────────────────
const BookIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const VideoIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
  </svg>
);

const QuestionIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const SupportIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg className={`w-5 h-5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const PrevIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20L9 12l10-8v16zM5 19V5" />
  </svg>
);

const NextIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 4l10 8-10 8V4zM19 5v14" />
  </svg>
);

const VolumeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072M5 12H3" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────
const GUIDES = [
  {
    icon: "📋",
    title: "How to File a Complaint",
    desc: "Step-by-step guide to submitting your first complaint — from registration to confirmation.",
    tag: "Beginner",
    tagColor: "bg-emerald-100 text-emerald-700",
    link: "/complaint",
    linkLabel: "File Now",
  },
  {
    icon: "🔍",
    title: "Tracking Your Complaint",
    desc: "Learn how to use the tracking system to monitor your complaint status in real-time.",
    tag: "Beginner",
    tagColor: "bg-emerald-100 text-emerald-700",
    link: "/track",
    linkLabel: "Track Now",
  },
  {
    icon: "⏱",
    title: "Understanding SLA & Deadlines",
    desc: "What are Service Level Agreements, how priorities affect resolution time, and what happens when SLA is breached.",
    tag: "Intermediate",
    tagColor: "bg-blue-100 text-blue-700",
    link: "#sla-guide",
    linkLabel: "Read More",
  },
  {
    icon: "🚨",
    title: "Priority Levels Explained",
    desc: "Difference between Low, Medium, High, and Critical — when to use each and what response time to expect.",
    tag: "Intermediate",
    tagColor: "bg-blue-100 text-blue-700",
    link: "#priority-guide",
    linkLabel: "Read More",
  },
  {
    icon: "📊",
    title: "Reading Analytics Reports",
    desc: "A guide for Analyzers and Admins on how to interpret KPIs, heatmaps, and department reports.",
    tag: "Advanced",
    tagColor: "bg-purple-100 text-purple-700",
    link: "/analytics",
    linkLabel: "Open Analytics",
  },
  {
    icon: "🏢",
    title: "Department Admin Handbook",
    desc: "Managing workers, assigning complaints, setting SLA thresholds, and reviewing department-level performance.",
    tag: "Advanced",
    tagColor: "bg-purple-100 text-purple-700",
    link: "/department-admin",
    linkLabel: "Go to Dashboard",
  },
];

const FAQS = [
  {
    q: "How do I register a complaint?",
    a: "Go to the Complaints page, click 'New Complaint', fill in your details — issue type, category, location, priority — and attach any photos if needed. You'll receive a confirmation with a tracking ID.",
  },
  {
    q: "How long does it take to resolve a complaint?",
    a: "Resolution time depends on priority. Critical issues: 1 day, High: 2 days, Medium: 3 days, Low: 7 days. These are SLA targets — actual resolution may be faster.",
  },
  {
    q: "What happens if my complaint is not resolved within the SLA?",
    a: "If the SLA deadline passes without resolution, the complaint is automatically escalated to a senior admin and marked as 'Breached'. You will be notified via the notifications panel.",
  },
  {
    q: "Can I track my complaint without logging in?",
    a: "Yes! Use the public Complaint Tracking page at /track. Enter your complaint ID or registered phone number/email to see real-time status updates.",
  },
  {
    q: "What do the different status labels mean?",
    a: "Pending: received, not yet reviewed. Verified: reviewed and confirmed valid. Assigned: worker assigned. In Progress: actively being worked on. Completed: resolved by worker. Approved: you've confirmed the resolution. Rejected: complaint was invalid.",
  },
  {
    q: "How do I approve or reject a resolution?",
    a: "Once a worker marks your complaint as Completed, you'll receive a notification. Open the complaint from your dashboard and click 'Approve' if satisfied, or 'Reject' with a reason if not.",
  },
  {
    q: "What is the difference between Admin and Department Admin?",
    a: "Admin manages all complaints across all departments. Department Admin manages only complaints routed to their specific department, and can assign workers within that department.",
  },
  {
    q: "How are complaints assigned to workers?",
    a: "Admins can manually assign a worker, or use the Auto-Assign feature which picks the least-loaded available worker in the relevant department automatically.",
  },
];

const DOWNLOADS = [
  {
    icon: "📄",
    title: "User Guide (PDF)",
    desc: "Complete guide for citizens — filing, tracking, and approval workflows.",
    size: "1.2 MB",
    type: "PDF",
    typeColor: "bg-red-100 text-red-700",
  },
  {
    icon: "📊",
    title: "Admin Handbook (PDF)",
    desc: "Full handbook for administrators and department admins.",
    size: "2.4 MB",
    type: "PDF",
    typeColor: "bg-red-100 text-red-700",
  },
  {
    icon: "📋",
    title: "SLA Policy Document",
    desc: "Official SLA timelines, priority definitions, and escalation rules.",
    size: "840 KB",
    type: "PDF",
    typeColor: "bg-red-100 text-red-700",
  },
  {
    icon: "📑",
    title: "Complaint Form Template",
    desc: "Printable offline complaint form for areas with limited internet access.",
    size: "320 KB",
    type: "DOCX",
    typeColor: "bg-blue-100 text-blue-700",
  },
];

const TUTORIALS = [
  { icon: "▶️", title: "How to Submit a Complaint", duration: "3:42", durationSecs: 222, level: "Beginner" },
  { icon: "▶️", title: "Tracking Your Complaint Status", duration: "2:15", durationSecs: 135, level: "Beginner" },
  { icon: "▶️", title: "Admin Dashboard Walkthrough", duration: "7:30", durationSecs: 450, level: "Admin" },
  { icon: "▶️", title: "Using the Analytics Dashboard", duration: "6:10", durationSecs: 370, level: "Analyzer" },
  { icon: "▶️", title: "Auto-Assign & SLA Monitoring", duration: "4:55", durationSecs: 295, level: "Admin" },
];

const LEVEL_COLOR = {
  Beginner: "bg-emerald-100 text-emerald-700",
  Admin: "bg-amber-100 text-amber-700",
  Analyzer: "bg-purple-100 text-purple-700",
};

// ─── FAQ Accordion ────────────────────────────────────────────────────────
const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border rounded-2xl transition-all duration-200 overflow-hidden ${open ? "border-sky-300 dark:border-sky-700" : "border-gray-200 dark:border-gray-700"}`}
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition"
      >
        <span className="font-semibold text-sm sm:text-base pr-4" style={{ color: "var(--text-main)" }}>{q}</span>
        <span className="flex-shrink-0" style={{ color: "var(--text-secondary)" }}>
          <ChevronIcon open={open} />
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {a}
        </div>
      )}
    </div>
  );
};

// ─── Video Player ─────────────────────────────────────────────────────────
const VideoPlayer = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // seconds elapsed
  const [volume, setVolume] = useState(80);
  const intervalRef = useRef(null);

  const current = TUTORIALS[currentIdx];

  // Format seconds -> "m:ss"
  const fmt = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPct = Math.min((progress / current.durationSecs) * 100, 100);

  const startPlay = () => {
    setPlaying(true);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= current.durationSecs) {
          clearInterval(intervalRef.current);
          setPlaying(false);
          return current.durationSecs;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const pause = () => {
    setPlaying(false);
    clearInterval(intervalRef.current);
  };

  const togglePlay = () => {
    if (playing) pause();
    else startPlay();
  };

  const selectVideo = (idx) => {
    pause();
    setCurrentIdx(idx);
    setProgress(0);
  };

  const prevVideo = () => selectVideo(Math.max(0, currentIdx - 1));
  const nextVideo = () => selectVideo(Math.min(TUTORIALS.length - 1, currentIdx + 1));

  const handleSeek = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const newSec = Math.round(ratio * current.durationSecs);
    setProgress(newSec);
  };

  // Clean up on unmount or video change
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, [currentIdx]);

  return (
    <div className="space-y-5">
      {/* Player card */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}
      >
        {/* Screen */}
        <div
          className="relative w-full bg-slate-900 cursor-pointer flex items-center justify-center"
          style={{ aspectRatio: "16/9" }}
          onClick={togglePlay}
        >
          {/* Thumbnail overlay */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 transition-opacity duration-300"
            style={{ opacity: playing ? 0.2 : 1 }}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            {/* Big play button */}
            <button
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="relative z-10 w-16 h-16 rounded-full bg-sky-500 hover:bg-sky-400 flex items-center justify-center transition-transform duration-150 hover:scale-105 shadow-lg"
            >
              {playing
                ? <PauseIcon />
                : <PlayIcon />
              }
            </button>
            <span className="relative z-10 text-white text-sm font-medium bg-black/40 px-4 py-1.5 rounded-full">
              {current.title}
            </span>
          </div>

          {/* Playing indicator bars */}
          {playing && (
            <div className="flex items-end gap-1 h-12">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1.5 bg-sky-400 rounded-sm"
                  style={{
                    animation: `bounce-bar ${0.4 + i * 0.1}s ease-in-out infinite alternate`,
                    height: `${20 + i * 8}px`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="px-5 pt-4 pb-1">
          <div
            className="w-full h-1.5 rounded-full cursor-pointer"
            style={{ backgroundColor: "var(--border-color)" }}
            onClick={handleSeek}
          >
            <div
              className="h-full bg-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Time row */}
        <div className="flex justify-between px-5 py-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span>{fmt(progress)}</span>
          <span>{current.duration}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 px-5 pb-4">
          <button
            onClick={prevVideo}
            disabled={currentIdx === 0}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition disabled:opacity-30 cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
          >
            <PrevIcon />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-xl bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition cursor-pointer"
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            onClick={nextVideo}
            disabled={currentIdx === TUTORIALS.length - 1}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition disabled:opacity-30 cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
          >
            <NextIcon />
          </button>

          {/* Volume */}
          <div className="flex items-center gap-2 ml-auto">
            <span style={{ color: "var(--text-secondary)" }}>
              <VolumeIcon />
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 accent-sky-500 cursor-pointer"
            />
            <span className="text-xs w-8" style={{ color: "var(--text-secondary)" }}>{volume}%</span>
          </div>
        </div>
      </div>

      {/* Playlist */}
      <div className="space-y-2">
        {TUTORIALS.map((t, i) => (
          <div
            key={i}
            onClick={() => selectVideo(i)}
            className={`flex items-center gap-4 rounded-2xl border p-4 cursor-pointer transition-all duration-150 group ${
              currentIdx === i
                ? "border-sky-400 dark:border-sky-600"
                : "hover:border-sky-300 dark:hover:border-sky-700"
            }`}
            style={{
              backgroundColor: currentIdx === i ? "rgba(14,165,233,0.06)" : "var(--bg-primary)",
              borderColor: currentIdx === i ? undefined : "var(--border-color)",
            }}
          >
            {/* Thumb */}
            <div
              className={`w-14 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                currentIdx === i ? "bg-sky-500" : "bg-slate-800 dark:bg-slate-700 group-hover:bg-sky-500/20"
              }`}
            >
              <svg
                className={`w-5 h-5 ml-0.5 transition-colors ${currentIdx === i ? "text-white" : "text-sky-400"}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: "var(--text-main)" }}>{t.title}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Duration: {t.duration}</p>
            </div>

            {/* Badge */}
            <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${LEVEL_COLOR[t.level] || "bg-gray-100 text-gray-700"}`}>
              {t.level}
            </span>
          </div>
        ))}
      </div>

      {/* Coming soon */}
      <div
        className="rounded-2xl border border-dashed p-8 text-center"
        style={{ borderColor: "var(--border-color)" }}
      >
        <p className="text-2xl mb-2">🎬</p>
        <p className="font-semibold mb-1" style={{ color: "var(--text-main)" }}>More tutorials coming soon</p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          We're constantly adding new walkthroughs based on user feedback.
        </p>
      </div>

      {/* Bounce animation style */}
      <style>{`
        @keyframes bounce-bar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────
const Resources = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("guides");

  const tabs = [
    { id: "guides",    label: "Guides",    icon: <BookIcon /> },
    { id: "faq",       label: "FAQ",       icon: <QuestionIcon /> },
    { id: "tutorials", label: "Tutorials", icon: <VideoIcon /> },
    { id: "downloads", label: "Downloads", icon: <DownloadIcon /> },
    { id: "support",   label: "Support",   icon: <SupportIcon /> },
  ];

  const filteredFaqs = FAQS.filter(
    f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );
  const filteredGuides = GUIDES.filter(
    g => g.title.toLowerCase().includes(search.toLowerCase()) || g.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1 mb-4 rounded-full bg-sky-100 text-sky-700 text-sm font-medium">
            📚 Resource Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
            Everything you need to
            <span className="text-sky-500"> get started</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Guides, tutorials, FAQs, and downloadable documents — for citizens, admins, and analysts.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search guides, FAQs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-5 py-4 rounded-2xl border text-base outline-none transition focus:ring-2 focus:ring-sky-400"
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border-color)",
                color: "var(--text-main)",
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Tab bar ── */}
      <div className="sticky top-20 z-30 border-b shadow-sm" style={{ backgroundColor: "var(--nav-bg)", borderColor: "var(--border-color)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto py-2 no-scrollbar">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition cursor-pointer flex-shrink-0 ${
                activeTab === t.id
                  ? "bg-sky-500 text-white shadow-sm"
                  : "hover:bg-black/5 dark:hover:bg-white/10"
              }`}
              style={{ color: activeTab === t.id ? "#fff" : "var(--text-secondary)" }}
            >
              <span className="w-4 h-4">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">

        {/* ══ GUIDES ══ */}
        {activeTab === "guides" && (
          <>
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-main)" }}>Documentation & Guides</h2>
              <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>Structured guides for every role — from first-time users to system administrators.</p>
            </div>

            {/* Filter badges */}
            <div className="flex gap-2 flex-wrap mb-2">
              {["All", "Beginner", "Intermediate", "Advanced"].map(level => (
                <button
                  key={level}
                  onClick={() => setSearch(level === "All" ? "" : level)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                    (search === level || (level === "All" && search === ""))
                      ? "bg-sky-500 text-white border-sky-500"
                      : "border-gray-200 dark:border-gray-700 hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                  style={{ color: (search === level || (level === "All" && search === "")) ? "#fff" : "var(--text-secondary)" }}
                >
                  {level}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {filteredGuides.map((g, i) => (
                <div
                  key={i}
                  className="group rounded-2xl border p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}
                  onClick={() => g.link.startsWith("/") ? navigate(g.link) : null}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{g.icon}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${g.tagColor}`}>{g.tag}</span>
                  </div>
                  <h3 className="font-bold text-base mb-2" style={{ color: "var(--text-main)" }}>{g.title}</h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>{g.desc}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); g.link.startsWith("/") ? navigate(g.link) : null; }}
                    className="flex items-center gap-1.5 text-sky-500 text-sm font-semibold hover:gap-3 transition-all duration-200 cursor-pointer"
                  >
                    {g.linkLabel} <ArrowIcon />
                  </button>
                </div>
              ))}
              {filteredGuides.length === 0 && (
                <div className="sm:col-span-2 text-center py-16" style={{ color: "var(--text-secondary)" }}>
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="font-medium">No guides found for "{search}"</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══ FAQ ══ */}
        {activeTab === "faq" && (
          <>
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-main)" }}>Frequently Asked Questions</h2>
              <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>Quick answers to the most common questions about the platform.</p>
            </div>

            <div className="space-y-3">
              {filteredFaqs.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
              {filteredFaqs.length === 0 && (
                <div className="text-center py-16 rounded-2xl border" style={{ color: "var(--text-secondary)", borderColor: "var(--border-color)", backgroundColor: "var(--bg-primary)" }}>
                  <p className="text-4xl mb-3">🤔</p>
                  <p className="font-medium">No FAQs found for "{search}"</p>
                  <p className="text-sm mt-2">Try a different keyword or contact support.</p>
                </div>
              )}
            </div>

            {/* Still have questions CTA */}
            <div className="mt-8 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-8 text-white text-center">
              <p className="text-xl font-bold mb-2">Still have a question?</p>
              <p className="text-sky-100 text-sm mb-5">Our support team is available to help you.</p>
              <button
                onClick={() => setActiveTab("support")}
                className="px-6 py-3 bg-white text-sky-600 font-bold rounded-xl hover:bg-sky-50 transition cursor-pointer"
              >
                Contact Support
              </button>
            </div>
          </>
        )}

        {/* ══ TUTORIALS ══ */}
        {activeTab === "tutorials" && (
          <>
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-main)" }}>Video Tutorials</h2>
              <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>Step-by-step walkthroughs for every feature of the platform.</p>
            </div>

            <VideoPlayer />
          </>
        )}

        {/* ══ DOWNLOADS ══ */}
        {activeTab === "downloads" && (
          <>
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-main)" }}>Downloadable Documents</h2>
              <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>Official documents, handbooks, and templates available for download.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {DOWNLOADS.map((d, i) => (
                <div
                  key={i}
                  className="rounded-2xl border p-6 hover:shadow-md transition group"
                  style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{d.icon}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${d.typeColor}`}>{d.type}</span>
                  </div>
                  <h3 className="font-bold mb-1" style={{ color: "var(--text-main)" }}>{d.title}</h3>
                  <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>{d.desc}</p>
                  <p className="text-xs mb-5" style={{ color: "var(--text-secondary)" }}>Size: {d.size}</p>
                  <button className="flex items-center gap-2 text-sm font-semibold text-sky-500 hover:gap-3 transition-all duration-200 cursor-pointer">
                    <DownloadIcon />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══ SUPPORT ══ */}
        {activeTab === "support" && (
          <>
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-main)" }}>Contact Support</h2>
              <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>Can't find what you're looking for? Reach out to our support team.</p>
            </div>

            {/* Contact cards */}
            <div className="grid sm:grid-cols-3 gap-5 mb-10">
              {[
                { icon: "💬", title: "Live Chat", desc: "Chat with a support agent directly.", badge: "Online", badgeColor: "bg-emerald-100 text-emerald-700", action: "Start Chat" },
                { icon: "📧", title: "Email Support", desc: "support@smartcomplaint.in", badge: "24h response", badgeColor: "bg-blue-100 text-blue-700", action: "Send Email" },
                { icon: "📞", title: "Phone Support", desc: "1800-XXX-XXXX (Toll Free)", badge: "Mon–Sat 9–6", badgeColor: "bg-amber-100 text-amber-700", action: "Call Now" },
              ].map((c, i) => (
                <div
                  key={i}
                  className="rounded-2xl border p-6 text-center hover:shadow-md transition"
                  style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}
                >
                  <span className="text-3xl">{c.icon}</span>
                  <span className={`inline-block mt-3 text-xs font-bold px-2.5 py-1 rounded-full ${c.badgeColor}`}>{c.badge}</span>
                  <h3 className="font-bold mt-3 mb-1" style={{ color: "var(--text-main)" }}>{c.title}</h3>
                  <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>{c.desc}</p>
                  <button className="w-full py-2.5 rounded-xl border font-semibold text-sm hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                    style={{ borderColor: "var(--border-color)", color: "var(--text-main)" }}>
                    {c.action}
                  </button>
                </div>
              ))}
            </div>

            {/* Contact form */}
            <div className="rounded-2xl border p-8" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}>
              <h3 className="text-lg font-bold mb-6" style={{ color: "var(--text-main)" }}>Send us a message</h3>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Your Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ravi Patel"
                    className="w-full px-4 py-3 rounded-xl border outline-none transition focus:ring-2 focus:ring-sky-400 text-sm"
                    style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border outline-none transition focus:ring-2 focus:ring-sky-400 text-sm"
                    style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Subject</label>
                  <input
                    type="text"
                    placeholder="Brief description of your issue"
                    className="w-full px-4 py-3 rounded-xl border outline-none transition focus:ring-2 focus:ring-sky-400 text-sm"
                    style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Message</label>
                  <textarea
                    rows={5}
                    placeholder="Describe your issue or question in detail…"
                    className="w-full px-4 py-3 rounded-xl border outline-none transition focus:ring-2 focus:ring-sky-400 text-sm resize-none"
                    style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition cursor-pointer">
                  Send Message
                </button>
              </div>
            </div>
          </>
        )}

      </div>

      {/* ── Quick links footer strip ── */}
      <section className="py-14 mt-8 border-t" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-primary)" }}>
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-lg font-bold mb-6" style={{ color: "var(--text-main)" }}>Quick Links</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "File a Complaint", path: "/complaint" },
              { label: "Track Status", path: "/track" },
              { label: "Analytics", path: "/analytics" },
              { label: "Login", path: "/login" },
              { label: "Sign Up", path: "/signup" },
            ].map(l => (
              <button
                key={l.label}
                onClick={() => navigate(l.path)}
                className="px-5 py-2.5 rounded-xl border text-sm font-semibold hover:bg-sky-500 hover:text-white hover:border-sky-500 transition cursor-pointer"
                style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)" }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 text-center" style={{ backgroundColor: "var(--bg-main)" }}>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>© 2026 SmartComplaint — Resource Center</p>
      </footer>

    </div>
  );
};

export default Resources;