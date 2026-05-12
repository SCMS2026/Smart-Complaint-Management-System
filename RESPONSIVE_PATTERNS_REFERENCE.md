# Responsive Refactoring - Quick Reference Patterns

## Pattern 1: From Inline Flexbox to Responsive Tailwind

### Problem: Fixed Direction
```jsx
// ❌ BEFORE: Always flex-row
style={{ display: "flex", flexDirection: "row", gap: "16px" }}
```

```jsx
// ✅ AFTER: Stack on mobile, row on desktop
className="flex flex-col sm:flex-row gap-4 sm:gap-6"
```

---

## Pattern 2: Responsive Grid Layouts

### Problem: Fixed Column Count
```jsx
// ❌ BEFORE: Always 2 columns
style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
```

```jsx
// ✅ AFTER: Mobile-first progression
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
```

**Progression Logic:**
- Mobile (< 640px): 1 column
- Tablet (640px-768px): 2 columns
- Desktop (768px-1024px): 3 columns
- Wide (1024px+): 4 columns

---

## Pattern 3: Responsive Typography

### Problem: Fixed Font Sizes
```jsx
// ❌ BEFORE: All sizes hardcoded
style={{ fontSize: 14 }}
```

```jsx
// ✅ AFTER: Scale with screen
className="text-xs sm:text-sm md:text-base lg:text-lg"
```

### Font Size Mapping:
| Class | Size |
|-------|------|
| `text-xs` | 12px |
| `text-sm` | 14px |
| `text-base` | 16px |
| `text-lg` | 18px |
| `text-xl` | 20px |
| `text-2xl` | 24px |

---

## Pattern 4: Responsive Padding & Spacing

### Problem: Fixed Spacing
```jsx
// ❌ BEFORE: Comfortable on desktop, cramped on mobile
style={{ padding: "24px", marginBottom: "20px" }}
```

```jsx
// ✅ AFTER: Tighter on mobile, generous on desktop
className="p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8"
```

### Spacing Progression:
| Mobile | Tablet | Desktop |
|--------|--------|---------|
| `p-3` (12px) | `sm:p-4` (16px) | `md:p-6` (24px) |
| `gap-2` (8px) | `sm:gap-3` (12px) | `md:gap-4` (16px) |
| `mb-4` (16px) | `sm:mb-6` (24px) | `md:mb-8` (32px) |

---

## Pattern 5: Responsive Button Groups

### Problem: Buttons Too Wide on Mobile
```jsx
// ❌ BEFORE: Grid never wraps efficiently
style={{ display: "flex", gap: 10, minWidth: "120px" }}
```

```jsx
// ✅ AFTER: Flex-wrap with scale
className="flex flex-wrap gap-2 sm:gap-3"
// Individual buttons:
className="flex-1 sm:flex-initial px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm"
```

---

## Pattern 6: Responsive Images

### Problem: Images Too Tall on Mobile
```jsx
// ❌ BEFORE: Fixed aspect ratio
style={{ width: "100%", height: 300 }}
```

```jsx
// ✅ AFTER: Flexible aspect ratio
className="w-full h-48 sm:h-64 md:h-80 object-cover"
// Or use aspect ratio:
className="w-full aspect-video"
```

### Aspect Ratio Classes:
- `aspect-square` (1:1)
- `aspect-video` (16:9)
- `aspect-auto`

---

## Pattern 7: Responsive Forms

### Problem: Form Fields Cramped on Mobile
```jsx
// ❌ BEFORE: 2-col grid always
style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
```

```jsx
// ✅ AFTER: 1-col mobile, 2-col desktop
className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"

// Full-width fields:
className="col-span-1 sm:col-span-2"
```

---

## Pattern 8: Responsive Cards

### Problem: Fixed Card Dimensions
```jsx
// ❌ BEFORE: Card too wide on mobile
style={{ padding: "24px", borderRadius: "12px", minWidth: "300px" }}
```

```jsx
// ✅ AFTER: Responsive sizing
className="p-4 sm:p-6 md:p-8 rounded-xl w-full sm:w-96"
```

---

## Pattern 9: Responsive Modals

### Problem: Modal Takes Entire Screen on Mobile
```jsx
// ❌ BEFORE: No padding buffer
style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
// Modal box: maxWidth: 500, no viewport consideration
```

```jsx
// ✅ AFTER: Adaptive modal with safe area
className="fixed inset-0 flex items-center justify-center p-4"

// Modal box:
className="bg-white rounded-xl w-full max-w-sm sm:max-w-md md:max-w-lg p-6 sm:p-8"
```

---

## Pattern 10: Hidden/Visible Elements by Breakpoint

### Problem: Layout Different Sizes but No Progressive Enhancement
```jsx
// ❌ BEFORE: Same content always shown
<h1>Dashboard</h1>
```

```jsx
// ✅ AFTER: Adaptive content
className="hidden sm:block text-2xl font-bold"  {/* Hide on mobile */}
className="sm:hidden text-lg font-bold"         {/* Mobile only */}
```

### Display Classes:
- `hidden` / `sm:hidden` - Hide element
- `block` / `sm:block` - Show element
- `inline` / `sm:inline` - Inline display

---

## Pattern 11: Responsive Gap & Flex Wrap

### Problem: Buttons Awkwardly Wrap
```jsx
// ❌ BEFORE: Fixed gap, no wrapping control
style={{ display: "flex", gap: 16 }}
```

```jsx
// ✅ AFTER: Responsive gap, intentional wrapping
className="flex flex-wrap gap-2 sm:gap-3 md:gap-4"
```

---

## Pattern 12: Responsive Container Queries

### Problem: Content Not Aware of Container Size
```jsx
// ❌ BEFORE: Only screen-aware
style={{ padding: screen.width > 768 ? 24 : 16 }}
```

```jsx
// ✅ AFTER: Let Tailwind handle
className="p-4 md:p-6 lg:p-8"

// Or container queries (advanced):
className="@container @md:grid @md:grid-cols-2"
```

---

## Pattern 13: Responsive Text Truncation

### Problem: Long Titles Overflow on Mobile
```jsx
// ❌ BEFORE: No truncation
<h1>{longTitle}</h1>
```

```jsx
// ✅ AFTER: Truncate on mobile, full on desktop
className="text-xl sm:text-2xl md:text-3xl truncate sm:truncate-none"

// Or line clamping:
className="line-clamp-1 sm:line-clamp-2 md:line-clamp-3"
```

---

## Pattern 14: Responsive Shadows & Hover States

### Problem: Static Shadows, No Interactive Feedback
```jsx
// ❌ BEFORE: Fixed shadow, event handlers for hover
style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 10px 20px..."; }}
```

```jsx
// ✅ AFTER: Responsive shadow classes, Tailwind hover states
className="
  shadow-md sm:shadow-lg md:shadow-xl
  hover:shadow-lg hover:shadow-blue-500/20
  transition-shadow duration-200
"
```

---

## Pattern 15: Responsive Border Radius

### Problem: Fixed Border Radius Looks Off on Mobile
```jsx
// ❌ BEFORE: Always large radius
style={{ borderRadius: "16px" }}
```

```jsx
// ✅ AFTER: Scale with content
className="rounded-lg sm:rounded-xl md:rounded-2xl"
```

### Radius Sizes:
- `rounded-lg` - 8px (small elements)
- `rounded-xl` - 12px (buttons, inputs)
- `rounded-2xl` - 16px (cards)
- `rounded-3xl` - 24px (large containers)

---

## Pattern 16: Responsive Overflow Handling

### Problem: Tabs/Content Overflow on Mobile
```jsx
// ❌ BEFORE: No scroll capability
<div style={{ display: "flex" }}>
  {/* Many items, causes horizontal scroll */}
</div>
```

```jsx
// ✅ AFTER: Scrollable on mobile, normal on desktop
className="flex overflow-x-auto sm:overflow-x-visible gap-2 sm:gap-4 pb-2"
```

---

## Pattern 17: Responsive Absolute Positioning

### Problem: Fixed Positioning Values Break on Mobile
```jsx
// ❌ BEFORE: Overlapping elements on mobile
style={{ position: "absolute", top: 20, right: 20 }}
```

```jsx
// ✅ AFTER: Responsive positioning
className="absolute inset-4 sm:inset-6 md:inset-8"
// Or:
className="absolute top-2 right-2 sm:top-4 sm:right-4 md:top-6 md:right-6"
```

---

## Pattern 18: Responsive Width Constraints

### Problem: Content Too Wide on Mobile
```jsx
// ❌ BEFORE: Fixed max-width, cramped on small screens
style={{ maxWidth: "1200px", margin: "0 auto" }}
```

```jsx
// ✅ AFTER: Container with responsive padding
className="max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl mx-auto px-4 sm:px-6 md:px-8"
```

### Max-Width Values:
- `max-w-xs` - 320px
- `max-w-sm` - 384px
- `max-w-md` - 448px
- `max-w-lg` - 512px
- `max-w-2xl` - 672px
- `max-w-4xl` - 896px
- `max-w-6xl` - 1152px

---

## Pattern 19: Responsive Z-Index Stacking

### Problem: Modals/Dropdowns Overlap Incorrectly
```jsx
// ❌ BEFORE: Z-index war on small screens
style={{ zIndex: 50 }}
```

```jsx
// ✅ AFTER: Semantic z-index management
// Navigation: z-40
// Modals: z-50
// Toasts: z-60
className="fixed ... z-50"
```

---

## Pattern 20: Responsive Aspect Ratio Containers

### Problem: Video/Image Embeds Break at Different Sizes
```jsx
// ❌ BEFORE: Fixed height for video
<div style={{ height: 300 }} />
```

```jsx
// ✅ AFTER: Maintain aspect ratio
<div className="w-full aspect-video">
  <iframe className="w-full h-full" src="..." />
</div>
```

---

## Complete Example: Complaint Card Transformation

### BEFORE (Inline Styles - 80% coverage):
```jsx
function ComplaintCard({ complaint }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E2E8F0",
      borderRadius: "12px",
      padding: "16px 20px",
      cursor: "pointer",
      transition: "all 0.2s",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      minHeight: "300px",
    }}>
      <img style={{ width: "100%", height: "160px", objectFit: "cover" }} src={complaint.image} />
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
        <div>
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>{complaint.title}</h3>
          <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", margin: 0 }}>{complaint.category}</p>
        </div>
        <span style={{ fontSize: "11px", background: "#EFF6FF", color: "#2563EB", padding: "4px 8px", borderRadius: "20px" }}>
          {complaint.status}
        </span>
      </div>
      
      <button style={{
        background: "#2563EB",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "12px 16px",
        fontWeight: 600,
        cursor: "pointer",
      }}>
        View Details
      </button>
    </div>
  );
}
```

### AFTER (Tailwind CSS - 100% responsive):
```jsx
function ComplaintCard({ complaint, theme }) {
  return (
    <div className={`
      rounded-xl border transition-all duration-200 cursor-pointer
      flex flex-col gap-3 sm:gap-4 p-4 sm:p-5
      ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-slate-600 hover:shadow-lg' : 'bg-white border-slate-200 hover:shadow-md'}
    `}>
      
      <img 
        className="w-full h-40 sm:h-48 object-cover rounded-lg" 
        src={complaint.image} 
        alt={complaint.title}
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm sm:text-base font-bold leading-tight truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {complaint.title}
          </h3>
          <p className={`text-xs sm:text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            {complaint.category}
          </p>
        </div>
        
        <span className="flex-shrink-0 text-xs sm:text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-semibold whitespace-nowrap">
          {complaint.status}
        </span>
      </div>
      
      <button className={`
        px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg
        transition-all duration-200 w-full
        ${theme === 'dark' 
          ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800' 
          : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
        }
      `}>
        View Details
      </button>
    </div>
  );
}
```

### Improvements:
✅ Mobile-first approach
✅ Responsive text sizes (text-sm sm:text-base)
✅ Responsive padding (p-4 sm:p-5)
✅ Responsive gaps (gap-3 sm:gap-4)
✅ Responsive image heights (h-40 sm:h-48)
✅ Responsive flexbox directions (flex-col sm:flex-row)
✅ Proper overflow handling (truncate, whitespace-nowrap)
✅ Touch-friendly button heights
✅ Dark mode support via theme prop
✅ Hover/active states via Tailwind
✅ No inline event handlers for styling

---

## Breakpoint Decision Tree

```
When designing a responsive component, ask:

┌─ What should happen on mobile (< 640px)?
│  └─ Base class (no prefix)
│
├─ What should change on tablets (640px+)?
│  └─ sm: prefix
│
├─ What should change on small desktops (768px+)?
│  └─ md: prefix
│
├─ What should change on desktops (1024px+)?
│  └─ lg: prefix
│
└─ What should change on large desktops (1280px+)?
   └─ xl: prefix
```

---

## Common Mistakes to Avoid

❌ **Mistake 1:** Using only `md:` without `sm:`
```jsx
// BAD: Jumps from mobile to tablet
className="text-sm md:text-base"

// GOOD: Progressive enhancement
className="text-xs sm:text-sm md:text-base"
```

❌ **Mistake 2:** Not considering overflow on mobile
```jsx
// BAD: Text/content overflows
className="px-6 py-4"

// GOOD: Safe padding on mobile
className="px-4 py-3 sm:px-6 sm:py-4"
```

❌ **Mistake 3:** Fixed container widths
```jsx
// BAD: Too wide on mobile
className="w-96"

// GOOD: Responsive with max-width
className="w-full sm:w-96"
```

❌ **Mistake 4:** Forgetting touch-friendly sizes
```jsx
// BAD: Too small for touch
className="p-2"

// GOOD: Min 44px height/width for touch targets
className="px-4 py-3 min-h-11"
```

❌ **Mistake 5:** Inline styles with ternaries instead of Tailwind variants
```jsx
// BAD: JavaScript ternaries
style={{ padding: isMobile ? 16 : 24 }}

// GOOD: Tailwind variants
className="p-4 sm:p-6"
```

