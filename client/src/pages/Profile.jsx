import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  MapPin,
  Building2,
  Shield,
  Camera,
  Check,
  X,
  Pencil,
  Loader2,
  AlertCircle,
} from "lucide-react";

// Stub service calls – replace with real imports in your project
// import { getMe, updateProfile } from "../services/auth";
// import { getDepartmentById } from "../services/department";

async function getMe() {
  return { user: JSON.parse(localStorage.getItem("user") || "null") };
}

async function updateProfile(payload) {
  const current = JSON.parse(localStorage.getItem("user") || "{}");
  const updated = { ...current, ...payload };
  localStorage.setItem("user", JSON.stringify(updated));
  return { success: true, user: updated };
}

async function getDepartmentById(id) {
  return null;
}

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors duration-200">
      <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
        <Icon size={16} className="text-blue-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-800 truncate">
          {value || <span className="text-gray-400 font-normal">—</span>}
        </p>
      </div>
    </div>
  );
}

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [avatarError, setAvatarError] = useState(false);

  const nameRef = useRef(null);

  useEffect(() => {
    (async () => {
      const local = localStorage.getItem("user");
      if (local) {
        const u = JSON.parse(local);
        hydrate(u);
        setLoading(false);
        return;
      }
      const data = await getMe();
      const u = data.user;
      if (u) hydrate(u);
      setLoading(false);
    })();
  }, []);

  function hydrate(u) {
    setUser(u);
    setNameInput(u.name || "");
    setImageInput(u.profileImage || "");
  }

  useEffect(() => {
    (async () => {
      if (!user) return;
      if (typeof user.department === "object" && user.department?.name) {
        setDepartmentName(user.department.name);
      } else if (typeof user.department === "string") {
        const res = await getDepartmentById(user.department);
        setDepartmentName(res?.name || "");
      } else {
        setDepartmentName("");
      }
    })();
  }, [user]);

  useEffect(() => {
    if (editMode) setTimeout(() => nameRef.current?.focus(), 50);
  }, [editMode]);

  async function handleSave() {
    setSaveLoading(true);
    setErrorMsg("");
    try {
      const res = await updateProfile({ name: nameInput, profileImage: imageInput });
      if (res.success) {
        setUser(res.user);
        localStorage.setItem("user", JSON.stringify(res.user));
        setEditMode(false);
        setAvatarError(false);
      } else {
        setErrorMsg(res.message || "Failed to save.");
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "An error occurred.");
    }
    setSaveLoading(false);
  }

  function handleCancel() {
    setNameInput(user?.name || "");
    setImageInput(user?.profileImage || "");
    setErrorMsg("");
    setEditMode(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 size={32} className="animate-spin text-blue-400" />
          <p className="text-sm font-medium">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Please log in to view your profile.</p>
      </div>
    );
  }

  const displayImage = editMode ? imageInput : user.profileImage;
  const showAvatar = !avatarError && !!displayImage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Profile</h1>
          <p className="text-sm text-gray-400 mt-0.5">View and manage your personal information</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            className="h-28 w-full relative"
            style={{
              background:
                "linear-gradient(135deg, #1d4ed8 0%, #2563eb 40%, #0ea5e9 100%)",
            }}
          >
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  {showAvatar ? (
                    <img
                      src={displayImage}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold select-none">
                      {initials(user.name)}
                    </span>
                  )}
                </div>
                {editMode && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow">
                    <Camera size={12} className="text-white" />
                  </div>
                )}
              </div>

              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl transition-colors duration-150"
                >
                  <Pencil size={14} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-150"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saveLoading}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-150 disabled:opacity-60"
                  >
                    {saveLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    {saveLoading ? "Saving…" : "Save"}
                  </button>
                </div>
              )}
            </div>

            {editMode ? (
              <div className="space-y-3 mb-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Display Name
                  </label>
                  <input
                    ref={nameRef}
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-base font-semibold text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Profile Image URL
                  </label>
                  <input
                    value={imageInput}
                    onChange={(e) => {
                      setImageInput(e.target.value);
                      setAvatarError(false);
                    }}
                    className="w-full px-3.5 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.name || "Unnamed User"}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
              </div>
            )}

            {!editMode && (
              <div className="flex flex-wrap gap-2 mt-3">
                {user.role && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                    <Shield size={11} />
                    {user.role}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                  <Building2 size={11} />
                  {departmentName || "No Department"}
                </span>
              </div>
            )}

            {errorMsg && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                <AlertCircle size={15} className="shrink-0" />
                {errorMsg}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100" />

          <div className="p-6 grid sm:grid-cols-2 gap-3">
            <InfoCard icon={Mail} label="Email" value={user.email} />
            <InfoCard
              icon={Building2}
              label="Department"
              value={departmentName || undefined}
            />
            <InfoCard
              icon={MapPin}
              label="Location"
              value={user.location || undefined}
            />
            <InfoCard
              icon={Shield}
              label="Role"
              value={user.role || undefined}
            />
            {user.joinedAt && (
              <InfoCard
                icon={User}
                label="Member Since"
                value={new Date(user.joinedAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">
          Your information is stored securely and never shared with third parties.
        </p>
      </div>
    </div>
  );
};

export default Profile;
