import React, { useState, useEffect } from "react";
import { getMe, updateProfile } from "../services/auth";
import { getDepartmentById } from "../services/department";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [profileImageInput, setProfileImageInput] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [departmentName, setDepartmentName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const local = localStorage.getItem("user");

      if (local) {
        const u = JSON.parse(local);
        setUser(u);
        setNameInput(u.name || "");
        setProfileImageInput(u.profileImage || "");
        setLoading(false);
        return;
      }

      const data = await getMe();
      const u = data.user || data;
      setUser(u);
      setNameInput(u.name || "");
      setProfileImageInput(u.profileImage || "");
      setLoading(false);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchDepartment = async () => {
      if (!user) return;

      if (typeof user.department === "object" && user.department?.name) {
        setDepartmentName(user.department.name);
      } else if (typeof user.department === "string") {
        const res = await getDepartmentById(user.department);
        if (res?.name) setDepartmentName(res.name);
      } else {
        setDepartmentName("");
      }
    };

    fetchDepartment();
  }, [user]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Please login</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}
      <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow">
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <p className="text-sm opacity-90">Manage your personal information</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">

        {/* Top Section */}
        <div className="flex items-center gap-6 p-6 border-b bg-gray-50">
          <div className="relative">
            <img
              src={
                editMode
                  ? profileImageInput || user.profileImage || "https://i.pravatar.cc/150"
                  : user.profileImage || "https://i.pravatar.cc/150"
              }
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
              alt=""
            />
          </div>

          <div className="flex-1">
            {editMode ? (
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="text-xl font-semibold border px-3 py-1 rounded w-full"
              />
            ) : (
              <h2 className="text-xl font-semibold text-gray-800">
                {user.name}
              </h2>
            )}

            <div className="flex gap-3 mt-1 flex-wrap">
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                {user.role}
              </span>

              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                {departmentName || "No Department"}
              </span>
            </div>

            {editMode && (
              <input
                type="text"
                placeholder="Profile Image URL"
                value={profileImageInput}
                onChange={(e) => setProfileImageInput(e.target.value)}
                className="mt-2 text-sm border px-2 py-1 rounded w-full"
              />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-gray-800 font-medium">{user.email}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-xs text-gray-500">Location</p>
            <p className="text-gray-800 font-medium">
              {user.location || "Earth"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">

          {editMode ? (
            <>
              <button
                onClick={async () => {
                  setSaveLoading(true);
                  setErrorMsg("");

                  try {
                    const res = await updateProfile({
                      name: nameInput,
                      profileImage: profileImageInput,
                    });

                    if (res.success) {
                      setUser(res.user);
                      localStorage.setItem("user", JSON.stringify(res.user));
                      setEditMode(false);
                    } else {
                      setErrorMsg(res.message);
                    }
                  } catch (e) {
                    setErrorMsg(e.message);
                  }

                  setSaveLoading(false);
                }}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
              >
                {saveLoading ? "Saving..." : "Save"}
              </button>

              <button
                onClick={() => setEditMode(false)}
                className="px-5 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
            >
              Edit Profile
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="px-6 pb-4 text-red-500 text-sm">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;