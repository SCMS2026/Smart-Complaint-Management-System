# Complete Responsive Refactoring Guide - Tailwind CSS

## Executive Summary

| File | Lines | Inline Styles | Priority | Effort |
|------|-------|----------------|----------|--------|
| **AllComplaints.jsx** | 1436 | ~80% | 🔴 CRITICAL | High |
| **Complainttracking.jsx** | ~800 | ~95% | 🔴 CRITICAL | High |
| **DepartmentAdminDashboard.jsx** | ~900 | ~30% | 🟡 IMPORTANT | Medium |

---

## FILE 1: AllComplaints.jsx (MOST CRITICAL)

### Overview
**Current State:** 1436 lines, ~80% inline styles, no responsive breakpoints
**Target:** Mobile-first Tailwind CSS, full responsiveness
**Estimated Changes:** 250+ refactoring points

### Section 1.1: Form Grid Layout (Lines 950-1050)

**Critical Issue:** Fixed 2-column grid breaks on tablets/mobile

**Current (BEFORE):**
```jsx
<form
  onSubmit={handleSubmit}
  style={{
    padding: 24,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",  // ❌ Fixed 2-col, no responsiveness
    gap: 16,
  }}
>
```

**Refactored (AFTER):**
```jsx
<form
  onSubmit={handleSubmit}
  className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4 p-6 sm:p-6"
>
```

**Responsive Breakdown Strategy:**
- `grid-cols-1` - Mobile (< 640px): Single column
- `sm:grid-cols-2` - Tablet (640px+): Two columns
- `gap-4` vs `gap-6` - Adjust spacing for mobile
- `p-6` mobile padding reduced if needed for very small screens

---

### Section 1.2: Field Components with Full-Width Support (Lines 420-500)

**Current (BEFORE):**
```jsx
const Field = ({ label, required, error, full, theme, children }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 4,
      gridColumn: full ? "1 / -1" : undefined,  // ❌ Inline conditional
    }}
  >
    <label style={{ fontSize: 12, fontWeight: 600, color: theme === "dark" ? "#CBD5E1" : "#374151" }}>
      {label}
      {required && <span style={{ color: "#EF4444" }}> *</span>}
    </label>
```

**Refactored (AFTER):**
```jsx
const Field = ({ label, required, error, full, theme, children }) => (
  <div className={`flex flex-col gap-1 ${full ? 'col-span-1 sm:col-span-2' : ''}`}>
    <label className={`text-xs sm:text-sm font-semibold ${
      theme === "dark" ? "text-slate-300" : "text-slate-600"
    }`}>
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
```

**Key Changes:**
- `flex flex-col gap-1` replaces `display: flex; flexDirection: column; gap: 4`
- `col-span-1 sm:col-span-2` handles full-width on mobile vs desktop
- `text-xs sm:text-sm` - scales font from 12px (mobile) → 14px (tablet+)
- Color classes: `text-slate-300` (dark), `text-slate-600` (light)

---

### Section 1.3: Input Field Styling Function (Lines 415-430)

**Current (BEFORE):**
```jsx
const inp = (err, theme) => ({
  border: `1.5px solid ${err ? "#EF4444" : theme === "dark" ? "#475569" : "#E2E8F0"}`,
  borderRadius: 8,
  padding: "9px 12px",
  fontSize: 14,
  color: theme === "dark" ? "#F1F5F9" : "#1E293B",
  outline: "none",
  background: theme === "dark" ? "#1E293B" : "#fff",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color .2s",
});
```

**Refactored (AFTER - CSS Module Approach):**

Create `AllComplaints.module.css`:
```css
.input {
  @apply w-full px-3 py-2 text-sm sm:text-base rounded-lg font-inherit
         transition-colors duration-200 outline-none;
}

.input.light {
  @apply bg-white text-slate-800 border-1.5 border-slate-200;
}

.input.light.error {
  @apply border-red-500 text-red-700;
}

.input.dark {
  @apply bg-slate-800 text-slate-100 border-1.5 border-slate-600;
}

.input.dark.error {
  @apply border-red-500 text-red-300;
}

.input:focus {
  @apply border-blue-500;
}
```

**Updated Input Usage:**
```jsx
<input
  className={`${styles.input} ${styles[theme]} ${err ? styles.error : ''}`}
  placeholder="Auto-filled from your profile"
  value={form.name}
  onChange={(e) => setField("name", e.target.value)}
/>
```

**Responsive Improvements:**
- `text-sm sm:text-base` - 14px mobile → 16px desktop
- `px-3 py-2` mobile padding reduced
- Scalable border styling
- Focus state via CSS instead of event handlers

---

### Section 1.4: Complaint Card Image & Layout (Lines 200-300)

**Current (BEFORE):**
```jsx
{c.image && (
  <img
    src={c.image}
    alt="complaint"
    style={{
      width: "100%",
      height: 160,          // ❌ Fixed height
      objectFit: "cover",
      display: "block",
    }}
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
  />
)}
<div
  style={{
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  }}
>
```

**Refactored (AFTER):**
```jsx
{c.image && (
  <img
    src={c.image}
    alt="complaint"
    className="w-full h-40 sm:h-48 object-cover block"
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
  />
)}
<div className="p-4 sm:p-5 flex flex-col gap-2 sm:gap-3">
```

**Responsive Pattern:**
- `h-40` (160px mobile) → `sm:h-48` (192px tablet+)
- `p-4 sm:p-5` - padding scales with screen
- `gap-2 sm:gap-3` - tighter spacing on mobile

---

### Section 1.5: Priority Button Group (Lines 920-945)

**Current (BEFORE):**
```jsx
<Field label="Priority" error={null} theme={theme}>
  <div style={{ display: "flex", gap: 8 }}>
    {["low", "medium", "high", "critical"].map((p) => (
      <button
        key={p}
        type="button"
        onClick={() => setField("priority", p)}
        style={{
          flex: 1,
          padding: "8px 12px",
          borderRadius: 8,
          border: form.priority === p ? `2px solid #2563EB` : `1.5px solid ${t.border}`,
          background: form.priority === p ? "#2563EB" : t.inputBg,
          color: form.priority === p ? "#fff" : t.textSecondary,
          fontWeight: 600,
          fontSize: 12,
          cursor: "pointer",
          transition: "all .2s",
        }}
      >
```

**Refactored (AFTER):**
```jsx
<Field label="Priority" error={null} theme={theme}>
  <div className="flex gap-2 sm:gap-3">
    {["low", "medium", "high", "critical"].map((p) => (
      <button
        key={p}
        type="button"
        onClick={() => setField("priority", p)}
        className={`
          flex-1 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm 
          font-semibold transition-all duration-200 cursor-pointer
          ${form.priority === p
            ? 'bg-blue-600 text-white border-2 border-blue-600'
            : `${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-200 text-slate-600'} border-1.5`
          }
          hover:scale-105 active:scale-95
        `}
      >
```

**Key Improvements:**
- `flex gap-2 sm:gap-3` - responsive button spacing
- `text-xs sm:text-sm` - font scales (12px → 14px)
- `px-3 py-2 sm:px-4 sm:py-2` - padding responsive
- `hover:scale-105 active:scale-95` - interactive feedback via Tailwind

---

### Section 1.6: Image Upload Zone (Lines 1085-1140)

**Current (BEFORE):**
```jsx
<div
  onClick={() => fileRef.current?.click()}
  style={{
    border: `2px dashed ${errors.image ? "#EF4444" : t.imageUploadBorder}`,
    borderRadius: 10,
    padding: "28px 20px",      // ❌ Fixed padding
    textAlign: "center",
    cursor: "pointer",
    background: t.imageUploadBg,
    transition: "all .2s",
    color: t.textSecondary,
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = "#2563EB";
    e.currentTarget.style.background = t.imageUploadHoverBg;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = errors.image ? "#EF4444" : t.imageUploadBorder;
    e.currentTarget.style.background = t.imageUploadBg;
  }}
>
  <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
```

**Refactored (AFTER):**
```jsx
<div
  onClick={() => fileRef.current?.click()}
  className={`
    p-6 sm:p-8 rounded-lg border-2 border-dashed text-center cursor-pointer
    transition-all duration-200 ${
      errors.image
        ? 'border-red-500 bg-red-50'
        : `border-slate-300 bg-slate-50 hover:border-blue-500 hover:bg-blue-50`
    }
    ${theme === 'dark' ? 'border-slate-600 bg-slate-800 hover:bg-slate-700' : ''}
  `}
>
  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📷</div>
```

**Responsive Improvements:**
- `p-6 sm:p-8` - padding 24px → 32px
- `text-4xl sm:text-5xl` - emoji scales with screen
- `mb-3 sm:mb-4` - margin responsive
- Hover states via Tailwind `hover:` classes

---

### Section 1.7: Complaint List Grid Pagination (Lines 1250-1350)

**Current (BEFORE):**
```jsx
<div
  style={{
    marginTop: 28,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  }}
>
  {/* Filter buttons */}
  {["all", "pending", "verified", "assigned", "in_progress", "completed", "rejected"].map((status) => (
    <button
      key={status}
      onClick={() => { setFilterStatus(status); setPage(1); }}
      style={{
        padding: "12px 18px",
        borderRadius: 8,
        border: `1.5px solid ${filterStatus === status ? "#2563EB" : t.border}`,
        background: filterStatus === status ? "#2563EB" : t.cardBg,
        color: filterStatus === status ? "#fff" : t.text,
        fontWeight: 600,
        fontSize: 14,
        cursor: "pointer",
      }}
    >
```

**Refactored (AFTER):**
```jsx
<div className="mt-8 flex flex-wrap justify-center items-center gap-2 sm:gap-3">
  {["all", "pending", "verified", "assigned", "in_progress", "completed", "rejected"].map((status) => (
    <button
      key={status}
      onClick={() => { setFilterStatus(status); setPage(1); }}
      className={`
        px-3 py-2 sm:px-4 sm:py-2 rounded-lg border-1.5 text-xs sm:text-sm
        font-semibold transition-all duration-200 whitespace-nowrap
        ${filterStatus === status
          ? 'bg-blue-600 text-white border-blue-600'
          : `${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`
        }
      `}
    >
```

**Key Changes:**
- `gap-2 sm:gap-3` - button spacing responsive
- `text-xs sm:text-sm` - font scales
- `px-3 py-2 sm:px-4 sm:py-2` - padding responsive
- `whitespace-nowrap` - prevents text wrapping
- `flex flex-wrap justify-center` - centers buttons with wrapping

---

### Section 1.8: Pagination Controls (Lines 1350-1400)

**Current (BEFORE):**
```jsx
<div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
    style={{
      padding: "8px 12px", borderRadius: 6, border: "none",
      background: page === 1 ? "#E2E8F0" : "#2563EB",
      color: page === 1 ? "#94A3B8" : "#fff",
      cursor: page === 1 ? "not-allowed" : "pointer",
      fontSize: 13, fontWeight: 600,
    }}>
    ← Prev
  </button>
  
  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
    <button key={p}
      onClick={() => setPage(p)}
      style={{
        padding: "8px 12px", borderRadius: 6,
        background: page === p ? "#2563EB" : "#fff",
        color: page === p ? "#fff" : "#1E293B",
        border: `1px solid ${page === p ? "#2563EB" : "#E2E8F0"}`,
        fontWeight: 600, fontSize: 13,
        cursor: "pointer",
      }}>
      {p}
    </button>
  ))}
  
  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
    style={{
      padding: "8px 12px", borderRadius: 6, border: "none",
      background: page === totalPages ? "#E2E8F0" : "#2563EB",
      color: page === totalPages ? "#94A3B8" : "#fff",
      cursor: page === totalPages ? "not-allowed" : "pointer",
      fontSize: 13, fontWeight: 600,
    }}>
    Next →
  </button>
</div>
```

**Refactored (AFTER):**
```jsx
<div className="flex gap-2 sm:gap-3 items-center justify-center flex-wrap mt-6">
  <button 
    onClick={() => setPage((p) => Math.max(1, p - 1))} 
    disabled={page === 1}
    className={`
      px-2 py-1 sm:px-3 sm:py-2 rounded text-xs sm:text-sm font-semibold
      transition-all duration-200
      ${page === 1
        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
        : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
      }
    `}
  >
    ← Prev
  </button>
  
  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    // Show pages: first, last, and around current
    const pages = [];
    if (totalPages <= 5) {
      for (let j = 1; j <= totalPages; j++) pages.push(j);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let j = Math.max(2, page - 1); j <= Math.min(totalPages - 1, page + 1); j++) {
        if (!pages.includes(j)) pages.push(j);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  })[0]?.map((p) => (
    p === '...' ? (
      <span key={p} className="text-slate-400">•••</span>
    ) : (
      <button
        key={p}
        onClick={() => setPage(p)}
        className={`
          px-2 py-1 sm:px-3 sm:py-2 rounded text-xs sm:text-sm font-semibold
          transition-all duration-200 border
          ${page === p
            ? 'bg-blue-600 text-white border-blue-600'
            : `${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`
          }
        `}
      >
        {p}
      </button>
    )
  ))}
  
  <button 
    onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
    disabled={page === totalPages}
    className={`
      px-2 py-1 sm:px-3 sm:py-2 rounded text-xs sm:text-sm font-semibold
      transition-all duration-200
      ${page === totalPages
        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
        : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
      }
    `}
  >
    Next →
  </button>
</div>
```

---

### Section 1.9: Complaint Cards Grid (Lines 1200-1250)

**Current (BEFORE):**
```jsx
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 16,
    marginTop: 24,
  }}
>
  {complaints.map((c) => (
    <ComplaintCard key={c._id} ... />
  ))}
</div>
```

**Refactored (AFTER):**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
  {complaints.map((c) => (
    <ComplaintCard key={c._id} ... />
  ))}
</div>
```

**Responsive Breakdown:**
- `grid-cols-1` - Mobile: 1 column
- `sm:grid-cols-2` - Tablet (640px+): 2 columns  
- `lg:grid-cols-3` - Desktop (1024px+): 3 columns
- `gap-4 sm:gap-6` - spacing scales with screen

---

### Section 1.10: Modal Reject Dialog (Lines 1110-1180)

**Current (BEFORE):**
```jsx
{showRejectModal && (
  <div style={{
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.5)", zIndex: 50,
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <div style={{
      background: t.cardBg, borderRadius: 12, padding: 24,
      maxWidth: 400, width: "90%",
      boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    }}>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: t.text }}>
        Reject Work
      </h3>
      <p style={{ margin: "12px 0", fontSize: 14, color: t.textSecondary }}>
        Please provide a reason for rejecting this work:
      </p>
```

**Refactored (AFTER):**
```jsx
{showRejectModal && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className={`
      ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-xl p-6 sm:p-8
      max-w-sm w-full shadow-2xl
    `}>
      <h3 className={`m-0 text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
        Reject Work
      </h3>
      <p className={`mt-3 sm:mt-4 text-sm sm:text-base ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
        Please provide a reason for rejecting this work:
      </p>
```

**Key Improvements:**
- `fixed inset-0` replaces `position: fixed; top/left/right/bottom: 0`
- `bg-black/50` replaces `rgba(0,0,0,0.5)`
- `p-4` on modal for mobile to avoid edge touching
- `p-6 sm:p-8` - padding scales
- `text-sm sm:text-base` - text responsive
- `rounded-xl` instead of hardcoded `borderRadius: 12`

---

### Section 1.11: Button Hover States (Lines 300-350)

**Current (BEFORE):**
```jsx
<button
  onClick={(e) => {
    e.stopPropagation();
    onView(c._id);
  }}
  style={{
    background: "#2563EB",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "12px 20px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    boxShadow: "0 16px 32px rgba(37,99,235,0.18)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    minHeight: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-1px)';
    e.currentTarget.style.boxShadow = '0 20px 38px rgba(37,99,235,0.24)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = '';
    e.currentTarget.style.boxShadow = '0 16px 32px rgba(37,99,235,0.18)';
  }}
>
  View Details
</button>
```

**Refactored (AFTER):**
```jsx
<button
  onClick={(e) => {
    e.stopPropagation();
    onView(c._id);
  }}
  className="
    bg-blue-600 text-white border-none rounded-xl py-3 px-5 sm:px-6
    font-bold text-xs sm:text-sm cursor-pointer min-h-11 flex items-center justify-center
    transition-all duration-200 shadow-lg
    hover:shadow-blue-500/40 hover:shadow-2xl hover:-translate-y-0.5
    active:translate-y-0 active:shadow-md
    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
  "
>
  View Details
</button>
```

**Advantages:**
- All hover/active states in CSS via Tailwind
- `hover:-translate-y-0.5` replaces JavaScript `translateY(-1px)`
- `shadow-2xl` responsive shadow
- `focus:ring-2` for accessibility
- Touch-friendly `min-h-11` (44px) for mobile

---

## FILE 2: Complainttracking.jsx (CRITICAL)

### Overview
**Current State:** ~800 lines, ~95% inline styles, fixed dimensions everywhere
**Target:** Responsive Tailwind with flexible layouts
**Estimated Changes:** 200+ refactoring points

---

### Section 2.1: Timeline Step Component (Lines 30-80)

**Current (BEFORE):**
```jsx
function TimelineStep({ step, index, total, isDark }) {
  const isLast = index === total - 1;
  return (
    <div style={{ display: "flex", gap: 16, position: "relative" }}>
      {!isLast && (
        <div style={{
          position: "absolute", left: 17, top: 36,
          width: 2, height: "calc(100% + 4px)",        // ❌ Fixed dimensions
          background: step.done
            ? "linear-gradient(180deg,#2563EB,#60A5FA)"
            : isDark ? "#334155" : "#E2E8F0",
        }} />
      )}
      <div style={{ flexShrink: 0, zIndex: 1 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",  // ❌ Fixed circle size
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
```

**Refactored (AFTER):**
```jsx
function TimelineStep({ step, index, total, isDark }) {
  const isLast = index === total - 1;
  return (
    <div className="flex gap-4 relative">
      {!isLast && (
        <div className={`
          absolute left-4.5 top-9 w-0.5 h-[calc(100%+4px)]
          ${step.done
            ? 'bg-gradient-to-b from-blue-600 to-blue-400'
            : isDark ? 'bg-slate-600' : 'bg-slate-200'
          }
        `} />
      )}
      <div className="flex-shrink-0 z-10">
        <div className={`
          w-9 h-9 sm:w-10 sm:h-10 rounded-full
          flex items-center justify-center font-bold text-sm sm:text-base
          transition-all duration-300
          ${step.active
            ? 'bg-gradient-to-br from-slate-700 to-blue-600 text-white border-2 border-blue-400 shadow-lg shadow-blue-500/20'
            : step.done
            ? 'bg-blue-600 text-white border-2 border-blue-600'
            : `${isDark ? 'bg-slate-700 text-slate-400 border-2 border-slate-600' : 'bg-slate-100 text-slate-300 border-2 border-slate-200'}`
          }
        `}>
          {step.done && !step.active ? "✓" : index + 1}
        </div>
      </div>
      <div className="pt-1.5 pb-6 sm:pb-8">
```

**Key Changes:**
- `w-9 h-9 sm:w-10 sm:h-10` - circles scale (36px → 40px)
- `gap-4` replaces `gap: 16`
- `left-4.5 top-9` - uses Tailwind spacing for absolute positioning
- `shadow-lg shadow-blue-500/20` - responsive shadow
- `h-[calc(100%+4px)]` - arbitrary value for custom calc

---

### Section 2.2: Search Box (Lines 300-350)

**Current (BEFORE):**
```jsx
<div style={{
  background: theme.card, border: `1px solid ${theme.border}`,
  borderRadius: 16, padding: 24, marginBottom: 24,
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
}}>
  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: theme.sub, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
    Search Complaints
  </label>
  <div style={{ display: "flex", gap: 10 }}>
    <input
      value={query}
      onChange={handleInput}
      onKeyDown={handleKeyDown}
      placeholder="Enter your name, issue (e.g. pothole, water leak) or location..."
      style={{
        flex: 1, padding: "12px 16px", borderRadius: 10,
        border: `1.5px solid ${theme.border}`, background: theme.input,
        color: theme.text, fontSize: 14, outline: "none",
        transition: "border-color 0.2s",
      }}
      onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
      onBlur={(e) => (e.target.style.borderColor = theme.border)}
    />
    <button
      onClick={() => { clearTimeout(debounceRef.current); doSearch(query); }}
      disabled={loading || query.trim().length < 2}
      style={{
        padding: "12px 24px", borderRadius: 10, border: "none",
        background: loading || query.trim().length < 2
          ? isDark ? "#1E293B" : "#E2E8F0"
          : "linear-gradient(135deg,#1E3A5F,#2563EB)",
        color: loading || query.trim().length < 2 ? theme.sub : "#fff",
        fontWeight: 700, fontSize: 14,
        cursor: loading || query.trim().length < 2 ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
      }}
    >
```

**Refactored (AFTER):**
```jsx
<div className={`
  ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} 
  border rounded-2xl p-6 sm:p-8 mb-6 shadow-md
`}>
  <label className={`
    block text-xs sm:text-sm font-bold mb-3 sm:mb-4 uppercase tracking-wider
    ${isDark ? 'text-slate-400' : 'text-slate-500'}
  `}>
    Search Complaints
  </label>
  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
    <input
      value={query}
      onChange={handleInput}
      onKeyDown={handleKeyDown}
      placeholder="Enter your name, issue (e.g. pothole, water leak) or location..."
      className={`
        flex-1 px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base
        transition-colors duration-200 outline-none
        ${isDark
          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'
          : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
        } border-1.5
      `}
    />
    <button
      onClick={() => { clearTimeout(debounceRef.current); doSearch(query); }}
      disabled={loading || query.trim().length < 2}
      className={`
        px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base
        transition-all duration-200 whitespace-nowrap
        flex items-center justify-center gap-2
        ${loading || query.trim().length < 2
          ? `${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'} cursor-not-allowed`
          : 'bg-gradient-to-r from-slate-800 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/30'
        }
      `}
    >
```

**Responsive Improvements:**
- `flex-col sm:flex-row` - stacked on mobile, row on desktop
- `gap-3 sm:gap-4` - spacing scales
- `text-sm sm:text-base` - input text scales
- `py-2.5 sm:py-3` - padding responsive
- Input border on focus via Tailwind focus state

---

### Section 2.3: Complaint Card Styling (Lines 100-150)

**Current (BEFORE):**
```jsx
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
```

**Refactored (AFTER):**
```jsx
function ComplaintCard({ complaint, isDark, theme, onSelect, isSelected }) {
  const priority = PRIORITY_CONFIG[complaint.priority] || PRIORITY_CONFIG.medium;
  const rejected = isRejected(complaint.status);

  return (
    <div
      onClick={() => onSelect(complaint)}
      className={`
        p-4 sm:p-5 rounded-xl border-1.5 cursor-pointer transition-all duration-200
        ${isSelected
          ? `bg-blue-50 border-blue-500 shadow-lg shadow-blue-500/20 ${isDark && 'dark:bg-slate-700 dark:border-blue-400'}`
          : `${isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:shadow-md'}`
        }
      `}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-wrap">
```

**Key Improvements:**
- `p-4 sm:p-5` - padding responsive
- `rounded-xl border-1.5` - consistent styling
- `flex-col sm:flex-row` - stack on mobile
- `gap-3` - responsive gap
- Shadow only on selected state via conditional classes

---

### Section 2.4: Detail Panel Layout (Lines 160-250)

**Current (BEFORE):**
```jsx
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
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: theme.text }}>
            {complaint.issue}
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: theme.sub }}>
            Submitted by {complaint.complainantName}
          </p>
        </div>
        <button onClick={onClose} style={{
          background: "transparent", border: "none",
          color: theme.sub, fontSize: 18, cursor: "pointer", padding: 4,
        }}>✕</button>
      </div>

      {/* Badges */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
```

**Refactored (AFTER):**
```jsx
function ComplaintDetail({ complaint, isDark, theme, onClose }) {
  const priority = PRIORITY_CONFIG[complaint.priority] || PRIORITY_CONFIG.medium;
  const sla = SLA_CONFIG[complaint.slaStatus] || SLA_CONFIG.on_track;
  const rejected = isRejected(complaint.status);

  return (
    <div className={`
      ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}
      border rounded-2xl p-6 sm:p-8 shadow-lg
    `}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <p className={`
            m-0 mb-2 text-xs sm:text-sm font-bold uppercase tracking-widest
            ${isDark ? 'text-slate-400' : 'text-slate-500'}
          `}>
            #{complaint.id?.slice(-8).toUpperCase()}
          </p>
          <h2 className={`
            m-0 text-lg sm:text-2xl font-bold
            ${isDark ? 'text-white' : 'text-slate-900'}
          `}>
            {complaint.issue}
          </h2>
          <p className={`
            mt-2 text-sm sm:text-base
            ${isDark ? 'text-slate-400' : 'text-slate-600'}
          `}>
            Submitted by {complaint.complainantName}
          </p>
        </div>
        <button 
          onClick={onClose} 
          className={`
            text-2xl cursor-pointer p-2 rounded-lg transition-colors
            ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}
          `}
        >
          ✕
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
```

**Improvements:**
- `flex-col sm:flex-row` - responsive header layout
- `text-lg sm:text-2xl` - heading scales
- Close button with proper hover states
- Responsive spacing `mb-6 sm:mb-8`

---

### Section 2.5: Results Grid Layout (Lines 330-380)

**Current (BEFORE):**
```jsx
{results && results.length > 0 && (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

    {/* Result count */}
    <p style={{ margin: 0, fontSize: 13, color: theme.sub, fontWeight: 500 }}>
      {results.length} complaint{results.length !== 1 ? "s" : ""} found
    </p>

    <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1.4fr" : "1fr", gap: 16, alignItems: "start" }}>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
```

**Refactored (AFTER):**
```jsx
{results && results.length > 0 && (
  <div className="flex flex-col gap-4 sm:gap-6">

    {/* Result count */}
    <p className={`m-0 text-sm sm:text-base font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
      {results.length} complaint{results.length !== 1 ? "s" : ""} found
    </p>

    <div className={`grid gap-4 sm:gap-6 items-start ${selected ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>

      {/* List */}
      <div className="lg:col-span-1 flex flex-col gap-3 sm:gap-4 order-2 lg:order-1">
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
        <div className="lg:col-span-2 order-1 lg:order-2">
          <ComplaintDetail
            complaint={selected}
            isDark={isDark}
            theme={theme}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </div>
```

**Responsive Behavior:**
- Mobile: Detail panel displays first, list below (via `order-`)
- Large: List left (1 col), detail right (2 col)
- `grid-cols-1 lg:grid-cols-3` - 3-col grid on large

---

## FILE 3: DepartmentAdminDashboard.jsx (IMPORTANT)

### Overview
**Current State:** Already using Tailwind (40%), but missing `sm:` breakpoints
**Target:** Complete responsive coverage with sm/md/lg breakpoints
**Estimated Changes:** 80+ refactoring points

---

### Section 3.1: Stats Grid (Lines 450-500)

**Current (BEFORE):**
```jsx
{/* Stats Grid */}
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
  {/* ❌ Missing sm: breakpoint, jumps from mobile 2-col to tablet 3-col */}
  <div className="bg-blue-50 rounded-xl p-4 text-center">
    <div className="text-2xl font-bold text-blue-600">{deptDashboard.stats?.totalComplaints || 0}</div>
    <div className="text-xs text-blue-500 font-semibold">Total Complaints</div>
  </div>
```

**Refactored (AFTER):**
```jsx
{/* Stats Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
  {/* Full responsive coverage: 1col → 2col → 3col → 6col */}
  <div className="bg-blue-50 hover:bg-blue-100 rounded-xl p-3 sm:p-4 text-center transition-colors">
    <div className="text-xl sm:text-2xl font-bold text-blue-600">{deptDashboard.stats?.totalComplaints || 0}</div>
    <div className="text-xs sm:text-sm text-blue-500 font-semibold mt-1.5">Total Complaints</div>
  </div>
```

**Responsive Progression:**
- Mobile: `grid-cols-1` (full width)
- Tablet: `sm:grid-cols-2` (640px+)
- Desktop: `md:grid-cols-3` (768px+)
- Wide: `lg:grid-cols-6` (1024px+)
- `text-xl sm:text-2xl` - font scales
- `p-3 sm:p-4` - padding responsive
- `gap-3 sm:gap-4` - spacing scales

---

### Section 3.2: Charts Container (Lines 520-550)

**Current (BEFORE):**
```jsx
{/* Charts */}
<div className="grid md:grid-cols-2 gap-6">
  {/* ❌ Missing sm: - charts stack 1 col until tablet */}
  <div className={`rounded-2xl border shadow-sm p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
    <h3 className={`font-semibold mb-4 text-sm uppercase tracking-wider ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
      Status Breakdown
    </h3>
```

**Refactored (AFTER):**
```jsx
{/* Charts */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
  {/* Optimized: 1col on mobile, 2col on desktop */}
  <div className={`
    rounded-2xl border shadow-sm p-4 sm:p-6
    transition-all hover:shadow-md
    ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-100 hover:border-slate-200'}
  `}>
    <h3 className={`
      font-semibold mb-4 text-xs sm:text-sm uppercase tracking-widest
      ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}
    `}>
      Status Breakdown
    </h3>
```

**Improvements:**
- `text-xs sm:text-sm` - heading scales
- `p-4 sm:p-6` - padding responsive
- `gap-4 sm:gap-6` - spacing scales
- `hover:shadow-md` - interactive feedback

---

### Section 3.3: Responsive Chart Height (Lines 555-575)

**Current (BEFORE):**
```jsx
{deptDashboard?.statusBreakdown && deptDashboard.statusBreakdown.length > 0 ? (
  <ResponsiveContainer width="100%" height={250}>
    <PieChart>
      {/* ❌ Fixed 250px height - not responsive */}
```

**Refactored (AFTER):**
```jsx
{deptDashboard?.statusBreakdown && deptDashboard.statusBreakdown.length > 0 ? (
  <ResponsiveContainer width="100%" height={200}>  {/* 200px mobile */}
    <PieChart>
      {/* Mobile-first: 200px, scale up via parent container */}
```

Add to component parent:
```jsx
<div className="h-48 sm:h-64 md:h-72 w-full">
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
```

**Key Point:** Let chart fill container height via `h-48 sm:h-64 md:h-72`

---

### Section 3.4: Tabs Navigation (Lines 350-380)

**Current (BEFORE):**
```jsx
<div className={`flex items-center gap-1 ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'} rounded-xl p-1 mb-6 shadow-sm w-fit`}>
  {[
    { id: "dashboard",   label: "Dashboard" },
    { id: "complaints",  label: "Complaints" },
    { id: "assign",      label: "Assign Worker" },
    { id: "permissions", label: permissions.length ? `Permissions (${permissions.length})` : "Permissions" },
  ].map(t => (
    <button key={t.id} onClick={() => setActiveTab(t.id)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === t.id ? (theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-white') + ' shadow' : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')}`}>
      {t.label}
    </button>
  ))}
</div>
```

**Refactored (AFTER):**
```jsx
<div className={`
  flex items-center gap-0.5 sm:gap-1 overflow-x-auto pb-2
  ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}
  rounded-xl p-1 mb-6 shadow-sm
`}>
  {[
    { id: "dashboard",   label: "Dashboard", icon: "📊" },
    { id: "complaints",  label: "Complaints", icon: "📋" },
    { id: "assign",      label: "Assign Worker", icon: "👤" },
    { id: "permissions", label: `Permissions${permissions.length ? ` (${permissions.length})` : ''}`, icon: "🔐" },
  ].map(t => (
    <button 
      key={t.id} 
      onClick={() => setActiveTab(t.id)}
      className={`
        px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold
        transition-all duration-200 whitespace-nowrap flex items-center gap-1.5
        ${activeTab === t.id 
          ? (theme === 'dark' ? 'bg-slate-700 text-white shadow-md' : 'bg-slate-900 text-white shadow-md')
          : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50')
        }
      `}
    >
      <span className="text-base">{t.icon}</span>
      <span className="hidden sm:inline">{t.label}</span>
    </button>
  ))}
</div>
```

**Mobile Optimizations:**
- `overflow-x-auto` - tabs scroll on small screens
- `text-xs sm:text-sm` - tab text scales
- `px-2 sm:px-4` - button padding responsive
- Icons on mobile, labels on desktop (via `hidden sm:inline`)
- `gap-0.5 sm:gap-1` - tighter spacing on mobile

---

### Section 3.5: Hero Section Responsive (Lines 280-320)

**Current (BEFORE):**
```jsx
<div className={`rounded-2xl text-white p-8 mb-6 shadow-lg relative overflow-hidden ...`}>
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold">  {/* ❌ Missing sm: on smaller elements */}
        {myDeptName ? `${myDeptName} Department` : "Department Dashboard"}
      </h1>
```

**Refactored (AFTER):**
```jsx
<div className={`
  rounded-2xl text-white p-6 sm:p-8 mb-6 shadow-lg relative overflow-hidden
  ${theme === 'dark' ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900'}
`}>
  <div className="flex flex-col sm:flex-row flex-wrap items-start justify-between gap-3 sm:gap-4">
    <div className="flex-1 min-w-0">
      <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-slate-300 mb-2">
        Department Admin
      </p>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight truncate">
        {myDeptName ? `${myDeptName} Department` : "Department Dashboard"}
      </h1>
      <p className="text-xs sm:text-sm text-slate-300 mt-2">
        {myDeptName
          ? `Showing only ${myDeptName} department complaints`
          : myDeptId ? "Loading department name…" : "No department assigned — ask Super Admin"}
      </p>
    </div>
```

**Responsive Improvements:**
- `p-6 sm:p-8` - padding scales
- `text-2xl sm:text-3xl lg:text-4xl` - h1 scales across all breakpoints
- `text-xs sm:text-sm` - subheading responsive
- `flex-col sm:flex-row` - stacks on mobile
- `min-w-0` - prevents text overflow
- `truncate` - handles long titles

---

### Section 3.6: Stats Display Row (Lines 330-345)

**Current (BEFORE):**
```jsx
<div className="flex flex-wrap gap-3 mt-6">
  {[
    { label: "Total",    value: stats.total,           color: "bg-white/10 text-white" },
    { label: "Pending",  value: stats.pending,         color: "bg-amber-500/20 text-amber-200" },
    { label: "Verified", value: stats.verified,        color: "bg-blue-500/20 text-blue-200" },
    // ... more stats
  ].map(s => (
    <div key={s.label} className={`px-4 py-2 rounded-xl ${s.color}`}>
      {/* ❌ Fixed px-4 py-2 - not responsive */}
```

**Refactored (AFTER):**
```jsx
<div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
  {[
    { label: "Total",    value: stats.total,           color: "bg-white/10 text-white" },
    { label: "Pending",  value: stats.pending,         color: "bg-amber-500/20 text-amber-200" },
    { label: "Verified", value: stats.verified,        color: "bg-blue-500/20 text-blue-200" },
    // ... more stats
  ].map(s => (
    <div key={s.label} className={`
      px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm
      font-semibold transition-transform hover:scale-105
      ${s.color}
    `}>
      <p className="text-base sm:text-lg font-bold leading-none mb-0.5">{s.value}</p>
      <p className="text-[10px] sm:text-xs opacity-80">{s.label}</p>
    </div>
  ))}
</div>
```

**Mobile-First Strategy:**
- `px-3 py-1.5 sm:px-4 sm:py-2` - padding tighter on mobile
- `text-xs sm:text-sm` - label text responsive
- `text-base sm:text-lg` - value text responsive
- `gap-2 sm:gap-3` - spacing scales

---

## IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Day 1)
- [ ] Create Tailwind CSS utility extraction for AllComplaints.jsx theme colors
- [ ] Extract theme object to CSS modules
- [ ] Remove inline styles function helpers (`inp`, theme objects)

### Phase 2: AllComplaints.jsx (Days 2-3)
- [ ] Convert form grid to responsive (Lines 950-1050)
- [ ] Refactor Field component (Lines 420-500)
- [ ] Update complaint cards grid (Lines 1200-1250)
- [ ] Fix pagination controls (Lines 1350-1400)
- [ ] Convert modals to responsive (Lines 1110-1180)

### Phase 3: Complainttracking.jsx (Days 3-4)
- [ ] Timeline step component responsive (Lines 30-80)
- [ ] Search box responsive (Lines 300-350)
- [ ] Complaint cards responsive (Lines 100-150)
- [ ] Detail panel responsive (Lines 160-250)
- [ ] Results grid layout (Lines 330-380)

### Phase 4: DepartmentAdminDashboard.jsx (Day 4)
- [ ] Add missing `sm:` breakpoints to stats grid
- [ ] Update chart containers
- [ ] Fix tabs navigation
- [ ] Responsive hero section
- [ ] Stats display row optimization

### Phase 5: Testing & QA (Day 5)
- [ ] Test all breakpoints: 320px, 640px, 768px, 1024px, 1280px
- [ ] Mobile device testing (iOS, Android)
- [ ] Touch interaction testing
- [ ] Accessibility audit

---

## TAILWIND CONFIGURATION NOTES

Ensure `tailwind.config.js` includes:
```js
module.exports = {
  theme: {
    extend: {
      spacing: {
        '4.5': '1.125rem', // For timeline positioning
      },
      borderWidth: {
        '1.5': '1.5px',    // Used in inputs/selects
      },
    }
  }
}
```

---

## RESPONSIVE BREAKPOINTS REFERENCE

| Breakpoint | Width | Use Case |
|-----------|-------|----------|
| Default | 0px+ | Mobile-first |
| `sm:` | 640px+ | Tablets, large phones |
| `md:` | 768px+ | iPad |
| `lg:` | 1024px+ | Desktop |
| `xl:` | 1280px+ | Wide desktop |

**Mobile-First Strategy:** Always start with base classes, add `sm:`, `md:`, `lg:` for larger screens.

