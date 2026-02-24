import React, { useEffect, useState } from "react";
import { getMe,logout } from "../services/auth";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Try localStorage first (set by login/register or Google handlers)
    const local = localStorage.getItem("user");
    if (local) {
      try {
        setUser(JSON.parse(local));
        return;
      } catch (e) {}
    }

    getMe().then((data) => {
      if (!data) return;
      if (data.user) setUser(data.user);
      else setUser(data);
    });
  }, []);

  // const logout = async () => {
  //   await fetch("http://localhost:5000/auth/logout", {
  //     method: "POST",
  //     credentials: "include",
  //   });

  //   localStorage.removeItem("user_token");
  //   localStorage.removeItem("user");

  //   window.location.reload();
  // };

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Glass Navbar */}
      <div className="backdrop-blur-xl bg-white/70 border-b border-white/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* ================= LOGO ================= */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
              SC
            </div>

            <h1 className="text-xl font-bold tracking-tight text-gray-800">
              Smart
              <span className="text-sky-500 group-hover:text-indigo-600 transition">
                Complaint
              </span>
            </h1>
          </a>

          {/* ================= NAV ================= */}
          <nav className="hidden md:flex items-center gap-2 font-medium text-gray-700">

            {/* SERVICES */}
            <div className="relative group">
              <button className="px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-black/5 transition">
                Services
                <svg
                  className="w-4 h-4 transition group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {/* Dropdown */}
              <div className="absolute left-0 mt-4 w-72 bg-white border rounded-2xl shadow-xl opacity-0 invisible translate-y-4 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300">
                <div className="p-4 space-y-3">

                  <a className="block p-3 rounded-xl hover:bg-sky-50 transition">
                    <p className="font-semibold text-gray-800">
                      Complaint Tracking
                    </p>
                    <span className="text-sm text-gray-500">
                      Track complaints in real-time
                    </span>
                  </a>

                  <a className="block p-3 rounded-xl hover:bg-purple-50 transition">
                    <p className="font-semibold text-gray-800">
                      Analytics
                    </p>
                    <span className="text-sm text-gray-500">
                      Smart insights & reports
                    </span>
                  </a>

                </div>
              </div>
            </div>

            <a
              href="#"
              className="px-4 py-2 rounded-lg hover:bg-black/5 transition"
            >
              Resources
            </a>

            <a
              href="#"
              className="px-4 py-2 rounded-lg hover:bg-black/5 transition"
            >
              Contact
            </a>
          </nav>

          {/* ================= AUTH ================= */}
          {!user ? (
            <div className="flex items-center gap-3">
              <a
                href="/login"
                className="px-4 py-2 rounded-xl hover:bg-black/5 transition font-medium"
              >
                Login
              </a>

              <a
                href="/signup"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition"
              >
                Sign Up
              </a>
            </div>
          ) : (
            <div className="relative">
              {/* Profile Button */}
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/5 transition"
              >
                <img
                  src={
                    user.profileImage || user.picture || user.googleProfile?.photo || user.avatar || "https://i.pravatar.cc/40"
                  }
                  alt="profile"
                  className="w-10 h-10 rounded-full border border-gray-200"
                />
                <span className="font-semibold text-gray-800">
                  {user.name || user.displayName || user.email}
                </span>
              </button>

              {/* Profile Dropdown */}
              <div
                className={`absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border p-2 transition-all duration-300 ${
                  open
                    ? "opacity-100 translate-y-0 visible"
                    : "opacity-0 -translate-y-3 invisible"
                }`}
              >
                <a
                  href="/dashboard"
                  className="block px-4 py-2.5 rounded-lg hover:bg-gray-100 transition"
                >
                  Dashboard
                </a>

                <a
                  href="/profile"
                  className="block px-4 py-2.5 rounded-lg hover:bg-gray-100 transition"
                >
                  Profile
                </a>

                <div className="h-px bg-gray-200 my-2"></div>

                <button 
                  
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;