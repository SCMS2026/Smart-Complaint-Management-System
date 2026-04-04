import React,{ useState, useEffect } from "react";
import { getMe, updateProfile } from "../services/auth";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // editing state
  const [editMode, setEditMode] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [profileImageInput, setProfileImageInput] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const local = localStorage.getItem("user");
      if (local) {
        try {
          const u = JSON.parse(local);
          setUser(u);
          setNameInput(u.name || "");
          setProfileImageInput(u.profileImage || "");
          setLoading(false);
          return;
        } catch (e) {
          console.error("Failed to parse local user", e);
        }
      }

      const data = await getMe();
      if (data) {
        const u = data.user || data;
        setUser(u);
        // prefill inputs
        setNameInput(u.name || "");
        setProfileImageInput(u.profileImage || "");
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!user) return <div className="text-center mt-10">Please log in to view your profile.</div>;

  return (
    <div className="min-h-screen bg-gray-100 min-w-screen dark:bg-gray-900 pb-10">
      {/* Cover Image */}
      <div className="h-64 w-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden p-8">
            <div className="flex flex-col items-center">
              {/* Avatar with Hover Effect */}
              <div className="relative group">
                <img
                  className="h-40 w-40 rounded-full border-4 border-white shadow-md object-cover"
                  src={
                    editMode
                      ? profileImageInput || user.profileImage || user.picture || user.googleProfile?.photo || user.avatar || "https://i.pravatar.cc/40"
                      : user.profileImage || user.picture || user.googleProfile?.photo || user.avatar || "https://i.pravatar.cc/40"
                  }
                  alt="Profile"
                />
                {editMode && (
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={profileImageInput}
                    onChange={(e) => setProfileImageInput(e.target.value)}
                    className="mt-2 w-full text-sm px-2 py-1 rounded border"
                  />
                )}
              </div>

              {/* Name & Role */}
              {editMode ? (
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded px-2"
                />
              ) : (
                <h1 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">
                  {user.name || "Anonymous User"}
                </h1>
              )}
              <p className="text-sm text-gray-500 mt-1">Role: {user.role || 'user'}</p>
              <p className="text-sm text-gray-500 mt-1">
                Department: {user.department && typeof user.department === 'object' ? user.department.name : user.department || 'Not assigned'}
              </p>
            </div>

            {/* Information Grid */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 dark:border-gray-700 pt-8">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Email location</h3>
                <p className="text-gray-900 dark:text-gray-200">{user.email || "Not provided"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Location</h3>
                <p className="text-gray-900 dark:text-gray-200">{user.location || "Earth"}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
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
                      } finally {
                        setSaveLoading(false);
                      }
                    }}
                    disabled={saveLoading}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all shadow-md active:scale-95"
                  >
                    {saveLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      // reset inputs
                      setNameInput(user.name || "");
                      setProfileImageInput(user.profileImage || "");
                      setErrorMsg("");
                      setEditMode(false);
                    }}
                    className="px-8 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-md active:scale-95"
                  >
                    Edit Profile
                  </button>
                  <button className="px-8 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all">
                    Settings
                  </button>
                </>
              )}
            </div>
            </div>
            {errorMsg && (
              <div className="mt-4 text-center text-red-600">
                {errorMsg}
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default Profile;
