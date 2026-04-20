import { useEffect, useState, useRef } from "react";
import {
  fetchComplaints,
  createComplaintRequest,
  userApproveComplaintRequest,
} from "../services/complaints";
import { fetchAssets } from "../services/assets";
import { getCurrentUser } from "../services/auth";

const lightTheme = {
  bg: "#F1F5F9",
  cardBg: "#fff",
  text: "#1E293B",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  inputBg: "#fff",
  inputBorder: "#E2E8F0",
  inputText: "#1E293B",
  inputPlaceholder: "#94A3B8",
  label: "#374151",
  headerBg: "linear-gradient(135deg,#1E3A5F,#2563EB)",
  headerShadow: "0 4px 20px rgba(37,99,235,.3)",
  successBg: "#D1FAE5",
  successBorder: "#6EE7B7",
  successText: "#065F46",
  errorBg: "#FEF2F2",
  errorBorder: "#FECACA",
  errorText: "#991B1B",
  formSectionBg: "#F8FAFC",
  formCardBg: "#fff",
  shadow: "0 4px 24px rgba(0,0,0,.08)",
  cardShadow: "0 2px 12px rgba(0,0,0,0.07)",
  cardHoverShadow: "0 8px 24px rgba(0,0,0,0.12)",
  filterBtnActiveBg: "#EFF6FF",
  filterBtnActiveColor: "#2563EB",
  filterBtnActiveBorder: "#2563EB",
  filterBtnBg: "#fff",
  filterBtnColor: "#64748B",
  filterBtnBorder: "#E2E8F0",
  imageUploadBg: "#F8FAFC",
  imageUploadBorder: "#CBD5E1",
  imageUploadHoverBg: "#EFF6FF",
  imageUploadHoverBorder: "#2563EB",
  spinnerBorder: "#E2E8F0",
  spinnerTop: "#2563EB",
  submitBtnHover: "linear-gradient(135deg,#1E40AF,#1E3A8A)",
};

const darkTheme = {
  bg: "#0F172A",
  cardBg: "#1E293B",
  text: "#F1F5F9",
  textSecondary: "#94A3B8",
  border: "#334155",
  inputBg: "#1E293B",
  inputBorder: "#475569",
  inputText: "#F1F5F9",
  inputPlaceholder: "#64748B",
  label: "#CBD5E1",
  headerBg: "linear-gradient(135deg,#1E3A5F,#1E40AF)",
  headerShadow: "0 4px 20px rgba(0,0,0,.4)",
  successBg: "#064E3B",
  successBorder: "#059669",
  successText: "#A7F3D0",
  errorBg: "#7F1D1D",
  errorBorder: "#DC2626",
  errorText: "#FECACA",
  formSectionBg: "#1E293B",
  formCardBg: "#1E293B",
  shadow: "0 4px 24px rgba(0,0,0,.4)",
  cardShadow: "0 2px 12px rgba(0,0,0,0.3)",
  cardHoverShadow: "0 8px 24px rgba(0,0,0,0.5)",
  filterBtnActiveBg: "#1E3A5F",
  filterBtnActiveColor: "#60A5FA",
  filterBtnActiveBorder: "#3B82F6",
  filterBtnBg: "#1E293B",
  filterBtnColor: "#94A3B8",
  filterBtnBorder: "#334155",
  imageUploadBg: "#1E293B",
  imageUploadBorder: "#475569",
  imageUploadHoverBg: "#1E3A5F",
  imageUploadHoverBorder: "#3B82F6",
  spinnerBorder: "#334155",
  spinnerTop: "#3B82F6",
  submitBtnHover: "linear-gradient(135deg,#1E40AF,#1E3A8A)",
};


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

const StatusBadge = ({ status, theme }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  const isDark = theme === "dark";
  return (
    <span
      style={{
        background: isDark ? `${s.bg}33` : s.bg,
        color: isDark ? (s.color === "#856404" ? "#FCD34D" : s.color === "#0C5460" ? "#67E8F9" : s.color === "#004085" ? "#93C5FD" : s.color === "#4B2D83" ? "#C4B5FD" : s.color === "#155724" ? "#86EFAC" : s.color === "#721C24" ? "#FCA5A5" : s.color === "#7B4F00" ? "#FDE68A" : s.color) : s.color,
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


const ComplaintCard = ({ c, theme, onApprove, onReject, approvalLoading }) => {
  const t = theme === "dark" ? darkTheme : lightTheme;
  const isApprovalPending = c.status === 'user_approval_pending';
  return (
  <div
    style={{
      background: t.cardBg,
      borderRadius: 14,
      boxShadow: t.cardShadow,
      overflow: "hidden",
      transition: "transform .15s, box-shadow .15s",
      borderTop: isApprovalPending ? "3px solid #F59E0B" : "3px solid #3B82F6",
      borderTop: "3px solid #3B82F6",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.boxShadow = t.cardHoverShadow;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "";
      e.currentTarget.style.boxShadow = t.cardShadow;
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
          <div style={{ fontWeight: 700, fontSize: 15, color: t.text }}>
            {c.category || "General"}
          </div>
          <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 2 }}>
            {c.issue || "—"}
          </div>
        </div>
        <StatusBadge status={c.status} theme={theme} />
      </div>
      {c.description && (
        <p
          style={{
            fontSize: 13,
            color: t.textSecondary,
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
          <span style={{ fontSize: 12, color: t.textSecondary }}>
            📍 {c.city}
            {c.District ? `, ${c.District}` : ""}
          </span>
        )}
        {c.createdAt && (
          <span style={{ fontSize: 11, color: t.textSecondary, marginLeft: "auto" }}>
            {new Date(c.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
      </div>
      {isApprovalPending && (
        <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.border}` }}>
          <button
            onClick={() => onApprove(c._id)}
            disabled={approvalLoading}
            style={{
              flex: 1,
              background: "#10B981",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              fontWeight: 600,
              fontSize: 13,
              cursor: approvalLoading ? "not-allowed" : "pointer",
              opacity: approvalLoading ? 0.7 : 1,
            }}
          >
            {approvalLoading ? "Processing..." : "✓ Approve Work"}
          </button>
          <button
            onClick={() => onReject(c._id)}
            disabled={approvalLoading}
            style={{
              flex: 1,
              background: "#EF4444",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              fontWeight: 600,
              fontSize: 13,
              cursor: approvalLoading ? "not-allowed" : "pointer",
              opacity: approvalLoading ? 0.7 : 1,
            }}
          >
            {approvalLoading ? "Processing..." : "✕ Reject Work"}
          </button>
        </div>
      )}
    </div>
  </div>
  );
};


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

const Field = ({ label, required, error, full, theme, children }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 4,
      gridColumn: full ? "1 / -1" : undefined,
    }}
  >
    <label style={{ fontSize: 12, fontWeight: 600, color: theme === "dark" ? "#CBD5E1" : "#374151" }}>
      {label}
      {required && <span style={{ color: "#EF4444" }}> *</span>}
    </label>
    {children}
    {error && <span style={{ fontSize: 11, color: "#EF4444" }}>⚠ {error}</span>}
  </div>
);


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
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingComplaintId, setRejectingComplaintId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.style.setProperty(
      "--bg-color", theme === "dark" ? darkTheme.bg : lightTheme.bg
    );
  }, [theme]);

  const t = theme === "dark" ? darkTheme : lightTheme;

  
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

  const handleApprove = async (complaintId) => {
    setApprovalLoading(true);
    const res = await userApproveComplaintRequest(complaintId, 'approve');
    setApprovalLoading(false);
    if (res.success) {
      setSuccess(true);
      reloadComplaints();
      setTimeout(() => setSuccess(false), 5000);
    } else {
      setSubErr(res.message || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setSubErr('Please provide a reason for rejection');
      return;
    }
    setApprovalLoading(true);
    const res = await userApproveComplaintRequest(rejectingComplaintId, 'reject', rejectionReason);
    setApprovalLoading(false);
    if (res.success) {
      setShowRejectModal(false);
      setRejectingComplaintId(null);
      setRejectionReason("");
      setSuccess(true);
      reloadComplaints();
      setTimeout(() => setSuccess(false), 5000);
    } else {
      setSubErr(res.message || 'Failed to reject');
    }
  };

  const openRejectModal = (complaintId) => {
    setRejectingComplaintId(complaintId);
    setShowRejectModal(true);
    setRejectionReason("");
  };

  const selectedAsset = assets.find(
    (a) => String(a._id) === String(form.assetId),
  );
  const categories =
    selectedAsset?.category?.length > 0 ? selectedAsset.category : [];

  
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((er) => ({ ...er, image: "Image must be smaller than 5MB" }));
      return;
    }

    setErrors((er) => {
      const n = { ...er };
      delete n.image;
      return n;
    });

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
  };

  const removeImage = () => {
    setPreview(null);
    setImageFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };
  
  const validate = () => {
    const e = {};
    if (!form.assetId) e.assetId = "Please select Department";
    if (!form.category) e.category = "Please select Issue";
    if (!form.location.trim()) e.location = "Please enter Location";
    if (!form.city.trim()) e.city = "Please enter City";
    if (!form.District.trim()) e.District = "Please enter District";
    if (!form.Taluka.trim()) e.Taluka = "Please enter Taluka";
    if (!form.village.trim()) e.village = "Please enter Village";
    if (!form.pincode.trim()) e.pincode = "Please enter Pincode";
    else if (!/^\d{6}$/.test(form.pincode))
      e.pincode = "Only 6 digit pincode is valid";
    if (!form.description.trim()) e.description = "Please enter Description";
    if (form.phone && !/^\d{10}$/.test(form.phone))
      e.phone = "10 digit phone number";
    return e;
  };

  
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
      formData.append("image", imageFile);
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
          background: t.bg,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            border: `4px solid ${t.spinnerBorder}`,
            borderTop: `4px solid ${t.spinnerTop}`,
            borderRadius: "50%",
            animation: "spin .8s linear infinite",
          }}
        />
        <p style={{ color: t.textSecondary, fontSize: 15, fontWeight: 500 }}>
          Loading...
        </p>
        <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        paddingBottom: 48,
      }}
    >
      <div
        style={{
          background: t.headerBg,
          color: "#fff",
          padding: "26px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: t.headerShadow,
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
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 10,
              padding: "10px 16px",
              fontWeight: 700,
              fontSize: 18,
              cursor: "pointer",
              transition: "transform .15s, background .2s",
              minWidth: 44,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.04)";
              e.currentTarget.style.background = "rgba(255,255,255,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
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
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
        {submitSuccess && (
          <div
            style={{
              marginTop: 20,
              background: t.successBg,
              border: `1px solid ${t.successBorder}`,
              borderRadius: 10,
              padding: "14px 20px",
              color: t.successText,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            ✅ Complaint successfully submitted!
          </div>
        )}

        {showForm && (
          <div
            style={{
              background: t.formCardBg,
              borderRadius: 16,
              marginTop: 24,
              boxShadow: t.shadow,
              overflow: "hidden",
              animation: "slideDown .25s ease",
            }}
          >
            <div
              style={{
                background: t.formSectionBg,
                padding: "16px 24px",
                borderBottom: `1px solid ${t.border}`,
                fontWeight: 700,
                fontSize: 16,
                color: t.text,
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
              <Field label="Your Name" error={errors.name} theme={theme}>
                <input
                  style={inp(errors.name, theme)}
                  placeholder="Auto-filled from your profile"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
              </Field>
              <Field label="Phone Number" error={errors.phone} theme={theme}>
                <input
                  style={inp(errors.phone, theme)}
                  placeholder="Auto-filled from your profile"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) =>
                    setField("phone", e.target.value.replace(/\D/g, ""))
                  }
                />
              </Field>

              <Field label="Department" required error={errors.assetId} theme={theme}>
                <select
                  style={{
                    ...inp(errors.assetId, theme),
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

              <Field label="Issue" required error={errors.category} theme={theme}>
                <select
                  style={{
                    ...inp(errors.category, theme),
                    appearance: "none",
                    backgroundImage: DROP,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    backgroundSize: 18,
                    paddingRight: 34,
                    color: !form.assetId ? t.inputPlaceholder : t.inputText,
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

              <Field
                label="Location / Address"
                required
                error={errors.location}
                theme={theme}
              >
                <input
                  style={inp(errors.location, theme)}
                  placeholder="e.g. Near Bus Stand"
                  value={form.location}
                  onChange={(e) => setField("location", e.target.value)}
                />
              </Field>
              <Field label="City" required error={errors.city} theme={theme}>
                <input
                  style={inp(errors.city, theme)}
                  placeholder="e.g. Surat"
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                />
              </Field>
              <Field label="District" required error={errors.District} theme={theme}>
                <input
                  style={inp(errors.District, theme)}
                  placeholder="e.g. Surat District"
                  value={form.District}
                  onChange={(e) => setField("District", e.target.value)}
                />
              </Field>
              <Field label="Taluka" required error={errors.Taluka} theme={theme}>
                <input
                  style={inp(errors.Taluka, theme)}
                  placeholder="e.g. Kamrej"
                  value={form.Taluka}
                  onChange={(e) => setField("Taluka", e.target.value)}
                />
              </Field>
              <Field label="Village" required error={errors.village} theme={theme}>
                <input
                  style={inp(errors.village, theme)}
                  placeholder="e.g. Sachin"
                  value={form.village}
                  onChange={(e) => setField("village", e.target.value)}
                />
              </Field>
              <Field label="Pincode" required error={errors.pincode} theme={theme}>
                <input
                  style={inp(errors.pincode, theme)}
                  placeholder="e.g. 395006"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) =>
                    setField("pincode", e.target.value.replace(/\D/g, ""))
                  }
                />
              </Field>

              <Field
                label="Description"
                required
                error={errors.description}
                full
                theme={theme}
              >
                <textarea
                  style={{
                    ...inp(errors.description, theme),
                    minHeight: 90,
                    resize: "vertical",
                  }}
                  placeholder="Describe the complaint details here..."
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </Field>

              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <label
                  style={{ fontSize: 12, fontWeight: 600, color: t.label }}
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
                        border: `1.5px solid ${t.border}`,
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
                      border: `2px dashed ${errors.image ? "#EF4444" : t.imageUploadBorder}`,
                      borderRadius: 10,
                      padding: "28px 20px",
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
                      e.currentTarget.style.borderColor = errors.image
                        ? "#EF4444"
                        : t.imageUploadBorder;
                      e.currentTarget.style.background = t.imageUploadBg;
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: 14,
                        color: t.textSecondary,
                      }}
                    >
                      Click to upload image
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 12,
                        color: t.textSecondary,
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

              {submitError && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    background: t.errorBg,
                    border: `1px solid ${t.errorBorder}`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: t.errorText,
                    fontSize: 13,
                  }}
                >
                  ⚠️ {submitError}
                </div>
              )}

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
                color: t.textSecondary,
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              style={{ ...inp(false, theme), paddingLeft: 34 }}
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
                    ? `2px solid ${t.filterBtnActiveBorder}`
                    : `1.5px solid ${t.filterBtnBorder}`,
                background: filterStatus === s ? t.filterBtnActiveBg : t.filterBtnBg,
                color: filterStatus === s ? t.filterBtnActiveColor : t.filterBtnColor,
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
              color: t.textSecondary,
              fontWeight: 500,
              marginLeft: "auto",
            }}
          >
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: t.textSecondary,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 16, fontWeight: 600, margin: 0, color: t.text }}>
              {complaints.length === 0
                ? "No complaints found"
                : "No matching complaints"}
            </p>
            <p style={{ fontSize: 13, marginTop: 6, color: t.textSecondary }}>
              {complaints.length === 0
                ? 'Click the "+ New Complaint" button above'
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
              <ComplaintCard 
                key={c._id} 
                c={c} 
                theme={theme} 
                onApprove={handleApprove}
                onReject={openRejectModal}
                approvalLoading={approvalLoading}
              />
            ))}
          </div>
        )}
      </div>

      {showRejectModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: t.cardBg,
            borderRadius: 16,
            padding: 24,
            width: "90%",
            maxWidth: 400,
            boxShadow: t.shadow,
          }}>
            <h3 style={{ margin: "0 0 16px", color: t.text, fontSize: 18, fontWeight: 700 }}>
              Reject Work
            </h3>
            <p style={{ color: t.textSecondary, marginBottom: 16, fontSize: 14 }}>
              Please provide a reason why the work is not satisfactory. This will be sent to the department for reassignment.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              style={{
                ...inp(false, theme),
                minHeight: 100,
                resize: "vertical",
                marginBottom: 16,
              }}
            />
            {submitError && (
              <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 12 }}>
                {submitError}
              </p>
            )}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingComplaintId(null);
                  setRejectionReason("");
                  setSubErr("");
                }}
                style={{
                  flex: 1,
                  background: t.border,
                  color: t.text,
                  border: "none",
                  borderRadius: 8,
                  padding: "10px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={approvalLoading}
                style={{
                  flex: 1,
                  background: "#EF4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px",
                  fontWeight: 600,
                  cursor: approvalLoading ? "not-allowed" : "pointer",
                  opacity: approvalLoading ? 0.7 : 1,
                }}
              >
                {approvalLoading ? "Submitting..." : "Submit Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform:rotate(360deg) } }
        select:focus, input:focus, textarea:focus { border-color:#2563EB !important; box-shadow:0 0 0 3px rgba(37,99,235,.12); }
      `}</style>
    </div>
  );
};

export default AllComplaints;
