import { useEffect, useState, useRef } from "react";
import {
  fetchComplaints,
  createComplaintRequest,
} from "../services/complaints";
import { fetchAssets } from "../services/assets";
import { getCurrentUser } from "../services/auth";

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
  pending: { bg: "#FFF3CD", color: "#856404", label: "⏳ Pending" },
  verified: { bg: "#D1ECF1", color: "#0C5460", label: "🔍 Verified" },
  assigned: { bg: "#CCE5FF", color: "#004085", label: "📌 Assigned" },
  in_progress: { bg: "#E2D9F3", color: "#4B2D83", label: "🔧 In Progress" },
  completed: { bg: "#D4EDDA", color: "#155724", label: "✅ Completed" },
  rejected: { bg: "#F8D7DA", color: "#721C24", label: "❌ Rejected" },
  user_approval_pending: {
    bg: "#FFF0D9",
    color: "#7B4F00",
    label: "🙋 Approval Pending",
  },
  approved_by_user: { bg: "#D4EDDA", color: "#155724", label: "👍 Approved" },
  rejected_by_user: {
    bg: "#F8D7DA",
    color: "#721C24",
    label: "👎 User Rejected",
  },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
};

// ─── Complaint Card ───────────────────────────────────────────────────────────
const ComplaintCard = ({ c }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 14,
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      overflow: "hidden",
      transition: "transform .15s, box-shadow .15s",
      borderTop: "3px solid #3B82F6",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "";
      e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)";
    }}
  >
    {c.image && (
      <img
        src={c.image}
        alt="complaint"
        style={{
          width: "100%",
          height: 160,
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#1E293B" }}>
            {c.category || "General"}
          </div>
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
            {c.issue || "—"}
          </div>
        </div>
        <StatusBadge status={c.status} />
      </div>
      {c.description && (
        <p
          style={{
            fontSize: 13,
            color: "#475569",
            margin: 0,
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {c.description}
        </p>
      )}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginTop: 4,
          alignItems: "center",
        }}
      >
        {c.city && (
          <span style={{ fontSize: 12, color: "#94A3B8" }}>
            📍 {c.city}
            {c.District ? `, ${c.District}` : ""}
          </span>
        )}
        {c.createdAt && (
          <span style={{ fontSize: 11, color: "#CBD5E1", marginLeft: "auto" }}>
            {new Date(c.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
      </div>
    </div>
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inp = (err) => ({
  border: `1.5px solid ${err ? "#EF4444" : "#E2E8F0"}`,
  borderRadius: 8,
  padding: "9px 12px",
  fontSize: 14,
  color: "#1E293B",
  outline: "none",
  background: "#fff",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color .2s",
});

const Field = ({ label, required, error, full, children }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 4,
      gridColumn: full ? "1 / -1" : undefined,
    }}
  >
    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
      {label}
      {required && <span style={{ color: "#EF4444" }}> *</span>}
    </label>
    {children}
    {error && <span style={{ fontSize: 11, color: "#EF4444" }}>⚠ {error}</span>}
  </div>
);

const toBase64 = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

// ─── Main Component ───────────────────────────────────────────────────────────
const EMPTY = {
  assetId: "",
  category: "",
  location: "",
  city: "",
  District: "",
  Taluka: "",
  village: "",
  pincode: "",
  description: "",
  name: "",
  phone: "",
};

const AllComplaints = () => {
  const [assets, setAssets] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSuccess] = useState(false);
  const [submitError, setSubErr] = useState("");
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [imagePreview, setPreview] = useState(null);
const [imageFile, setImageFile] = useState(null);
  const fileRef = useRef();

  // ── Load data + auto-fill user info ─────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [assetsRes, complaintsRes, user] = await Promise.all([
        fetchAssets(),
        fetchComplaints(),
        getCurrentUser(),
      ]);
      if (assetsRes.success) setAssets(assetsRes.assets || []);
      if (complaintsRes.success) setComplaints(complaintsRes.complaints || []);
      if (user) {
        setForm((f) => ({
          ...f,
          name: user.name || "",
          phone: user.phone || "",
        }));
      }
      setLoading(false);
    })();
  }, []);

  const reloadComplaints = async () => {
    const res = await fetchComplaints();
    if (res.success) setComplaints(res.complaints || []);
  };

  const selectedAsset = assets.find(
    (a) => String(a._id) === String(form.assetId),
  );
  const categories =
    selectedAsset?.category?.length > 0 ? selectedAsset.category : [];

  // ── Image pick ───────────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((er) => ({ ...er, image: "Image 5MB થી નાની હોવી જોઈએ" }));
      return;
    }

    setErrors((er) => {
      const n = { ...er };
      delete n.image;
      return n;
    });

    setImageFile(file); // ✅ important

    // preview only
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
  };

  const removeImage = () => {
  setPreview(null);
  setImageFile(null); // ✅ important
  if (fileRef.current) fileRef.current.value = "";
};
  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.assetId) e.assetId = "Department પસંદ કરો";
    if (!form.category) e.category = "Issue પસંદ કરો";
    if (!form.location.trim()) e.location = "Location લખો";
    if (!form.city.trim()) e.city = "City લખો";
    if (!form.District.trim()) e.District = "District લખો";
    if (!form.Taluka.trim()) e.Taluka = "Taluka લખો";
    if (!form.village.trim()) e.village = "Village લખો";
    if (!form.pincode.trim()) e.pincode = "Pincode લખો";
    else if (!/^\d{6}$/.test(form.pincode))
      e.pincode = "6 digit pincode જ માન્ય છે";
    if (!form.description.trim()) e.description = "Description લખો";
    if (form.phone && !/^\d{10}$/.test(form.phone))
      e.phone = "10 digit phone number";
    return e;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
  e.preventDefault();

  const errs = validate();
  if (Object.keys(errs).length) {
    setErrors(errs);
    return;
  }

  setErrors({});
  setSubmitting(true);
  setSubErr("");

  const formData = new FormData();

  formData.append("assetId", form.assetId);
  formData.append("issue", selectedAsset?.issue || "");
  formData.append("category", form.category);
  formData.append("location", form.location);
  formData.append("city", form.city);
  formData.append("District", form.District);
  formData.append("Taluka", form.Taluka);
  formData.append("village", form.village);
  formData.append("pincode", form.pincode);
  formData.append("description", form.description);

  if (imageFile) {
    formData.append("image", imageFile); // ✅ REAL FIX
  }

  const res = await createComplaintRequest(formData);

  setSubmitting(false);

  if (res.success) {
    setSuccess(true);
    setForm(f => ({ ...EMPTY, name: f.name, phone: f.phone }));
    removeImage();
    setShowForm(false);
    reloadComplaints();
    setTimeout(() => setSuccess(false), 5000);
  } else {
    setSubErr(res.message || "Submission failed");
  }
};

  const setField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((er) => {
      const n = { ...er };
      delete n[key];
      return n;
    });
  };

  // ── Filter & Search ──────────────────────────────────────────────────────────
  const filtered = complaints.filter((c) => {
    const okStatus = filterStatus === "all" || c.status === filterStatus;
    const q = search.toLowerCase();
    const okSearch =
      !q ||
      (c.category || "").toLowerCase().includes(q) ||
      (c.issue || "").toLowerCase().includes(q) ||
      (c.city || "").toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q);
    return okStatus && okSearch;
  });

  const DROP = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`;

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
          gap: 16,
          background: "#F1F5F9",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            border: "4px solid #E2E8F0",
            borderTop: "4px solid #2563EB",
            borderRadius: "50%",
            animation: "spin .8s linear infinite",
          }}
        />
        <p style={{ color: "#64748B", fontSize: 15, fontWeight: 500 }}>
          Loading...
        </p>
        <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F1F5F9",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        paddingBottom: 48,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: "linear-gradient(135deg,#1E3A5F,#2563EB)",
          color: "#fff",
          padding: "26px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 20px rgba(37,99,235,.3)",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
            📋 Complaints
          </h1>
          <p style={{ margin: "4px 0 0", opacity: 0.8, fontSize: 13 }}>
            {complaints.length} total complaint
            {complaints.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm((v) => !v);
            setErrors({});
            setSubErr("");
          }}
          style={{
            background: "#fff",
            color: "#2563EB",
            border: "none",
            borderRadius: 10,
            padding: "10px 22px",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            transition: "transform .15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.04)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
        >
          {showForm ? "✕ Close" : "+ New Complaint"}
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
        {/* ── Success Banner ── */}
        {submitSuccess && (
          <div
            style={{
              marginTop: 20,
              background: "#D1FAE5",
              border: "1px solid #6EE7B7",
              borderRadius: 10,
              padding: "14px 20px",
              color: "#065F46",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            ✅ Complaint successfully submitted!
          </div>
        )}

        {/* ── Form ── */}
        {showForm && (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              marginTop: 24,
              boxShadow: "0 4px 24px rgba(0,0,0,.08)",
              overflow: "hidden",
              animation: "slideDown .25s ease",
            }}
          >
            <div
              style={{
                background: "#F8FAFC",
                padding: "16px 24px",
                borderBottom: "1px solid #E2E8F0",
                fontWeight: 700,
                fontSize: 16,
                color: "#1E293B",
              }}
            >
              🆕 New Complaint
            </div>

            <form
              onSubmit={handleSubmit}
              style={{
                padding: 24,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {/* Auto-filled user info */}
              <Field label="Your Name" error={errors.name}>
                <input
                  style={inp(errors.name)}
                  placeholder="Auto-filled from your profile"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
              </Field>
              <Field label="Phone Number" error={errors.phone}>
                <input
                  style={inp(errors.phone)}
                  placeholder="Auto-filled from your profile"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) =>
                    setField("phone", e.target.value.replace(/\D/g, ""))
                  }
                />
              </Field>

              {/* Department */}
              <Field label="Department" required error={errors.assetId}>
                <select
                  style={{
                    ...inp(errors.assetId),
                    appearance: "none",
                    backgroundImage: DROP,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    backgroundSize: 18,
                    paddingRight: 34,
                  }}
                  value={form.assetId}
                  onChange={(e) => {
                    setField("assetId", e.target.value);
                    setField("category", "");
                  }}
                >
                  <option value="">— Select Department —</option>
                  {assets.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.issue}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Issue */}
              <Field label="Issue" required error={errors.category}>
                <select
                  style={{
                    ...inp(errors.category),
                    appearance: "none",
                    backgroundImage: DROP,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    backgroundSize: 18,
                    paddingRight: 34,
                    color: !form.assetId ? "#94A3B8" : "#1E293B",
                  }}
                  value={form.category}
                  disabled={!form.assetId}
                  onChange={(e) => setField("category", e.target.value)}
                >
                  <option value="">
                    {!form.assetId
                      ? "— First select Department —"
                      : "— Select Issue —"}
                  </option>
                  {categories.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Location fields */}
              <Field
                label="Location / Address"
                required
                error={errors.location}
              >
                <input
                  style={inp(errors.location)}
                  placeholder="e.g. Near Bus Stand"
                  value={form.location}
                  onChange={(e) => setField("location", e.target.value)}
                />
              </Field>
              <Field label="City" required error={errors.city}>
                <input
                  style={inp(errors.city)}
                  placeholder="e.g. Surat"
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                />
              </Field>
              <Field label="District" required error={errors.District}>
                <input
                  style={inp(errors.District)}
                  placeholder="e.g. Surat District"
                  value={form.District}
                  onChange={(e) => setField("District", e.target.value)}
                />
              </Field>
              <Field label="Taluka" required error={errors.Taluka}>
                <input
                  style={inp(errors.Taluka)}
                  placeholder="e.g. Kamrej"
                  value={form.Taluka}
                  onChange={(e) => setField("Taluka", e.target.value)}
                />
              </Field>
              <Field label="Village" required error={errors.village}>
                <input
                  style={inp(errors.village)}
                  placeholder="e.g. Sachin"
                  value={form.village}
                  onChange={(e) => setField("village", e.target.value)}
                />
              </Field>
              <Field label="Pincode" required error={errors.pincode}>
                <input
                  style={inp(errors.pincode)}
                  placeholder="e.g. 395006"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) =>
                    setField("pincode", e.target.value.replace(/\D/g, ""))
                  }
                />
              </Field>

              {/* Description */}
              <Field
                label="Description"
                required
                error={errors.description}
                full
              >
                <textarea
                  style={{
                    ...inp(errors.description),
                    minHeight: 90,
                    resize: "vertical",
                  }}
                  placeholder="Complaint ની detail describe કરો..."
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </Field>

              {/* Image Upload */}
              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <label
                  style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}
                >
                  📷 Photo (optional)
                </label>
                {imagePreview ? (
                  <div style={{ position: "relative" }}>
                    <img
                      src={imagePreview}
                      alt="preview"
                      style={{
                        width: "100%",
                        maxHeight: 220,
                        objectFit: "cover",
                        borderRadius: 10,
                        border: "1.5px solid #E2E8F0",
                        display: "block",
                      }}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "rgba(0,0,0,.6)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: 28,
                        height: 28,
                        cursor: "pointer",
                        fontSize: 16,
                        lineHeight: "28px",
                        textAlign: "center",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border: `2px dashed ${errors.image ? "#EF4444" : "#CBD5E1"}`,
                      borderRadius: 10,
                      padding: "28px 20px",
                      textAlign: "center",
                      cursor: "pointer",
                      background: "#F8FAFC",
                      transition: "all .2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#2563EB";
                      e.currentTarget.style.background = "#EFF6FF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = errors.image
                        ? "#EF4444"
                        : "#CBD5E1";
                      e.currentTarget.style.background = "#F8FAFC";
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#475569",
                      }}
                    >
                      Click to upload image
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 12,
                        color: "#94A3B8",
                      }}
                    >
                      PNG, JPG, JPEG — max 5MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                {errors.image && (
                  <span style={{ fontSize: 11, color: "#EF4444" }}>
                    ⚠ {errors.image}
                  </span>
                )}
              </div>

              {/* Submit Error */}
              {submitError && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#991B1B",
                    fontSize: 13,
                  }}
                >
                  ⚠️ {submitError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  gridColumn: "1 / -1",
                  background: submitting
                    ? "#93C5FD"
                    : "linear-gradient(135deg,#2563EB,#1E40AF)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 0",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(37,99,235,.35)",
                }}
              >
                {submitting ? "⏳ Submitting..." : "🚀 Submit Complaint"}
              </button>
            </form>
          </div>
        )}

        {/* ── Filter & Search ── */}
        <div
          style={{
            marginTop: 28,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div
            style={{ position: "relative", flex: "1 1 220px", maxWidth: 320 }}
          >
            <span
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 15,
                color: "#94A3B8",
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              style={{ ...inp(false), paddingLeft: 34, background: "#fff" }}
              placeholder="Search complaints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {[
            "all",
            "pending",
            "verified",
            "assigned",
            "in_progress",
            "completed",
            "rejected",
          ].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                border:
                  filterStatus === s
                    ? "2px solid #2563EB"
                    : "1.5px solid #E2E8F0",
                background: filterStatus === s ? "#EFF6FF" : "#fff",
                color: filterStatus === s ? "#2563EB" : "#64748B",
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              {s === "all"
                ? "All"
                : s.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
          <span
            style={{
              fontSize: 13,
              color: "#94A3B8",
              fontWeight: 500,
              marginLeft: "auto",
            }}
          >
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Complaints Grid ── */}
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#94A3B8",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
              {complaints.length === 0
                ? "કોઈ complaint નથી"
                : "No matching complaints"}
            </p>
            <p style={{ fontSize: 13, marginTop: 6 }}>
              {complaints.length === 0
                ? 'ઉપર "+ New Complaint" button click કરો'
                : "Try a different search or filter"}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
              marginTop: 20,
            }}
          >
            {filtered.map((c) => (
              <ComplaintCard key={c._id} c={c} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform:rotate(360deg) } }
        select:focus, input:focus, textarea:focus { border-color:#2563EB !important; box-shadow:0 0 0 3px rgba(37,99,235,.12); }
      `}</style>
    </div>
  );
};

export default AllComplaints;
