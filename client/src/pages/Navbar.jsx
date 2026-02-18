import React, { useEffect, useState } from "react";
import { getMe } from "../services/auth";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getMe().then((data) => {
      if (data.user) setUser(data.user);
    });
  }, []);

  const logout = async () => {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    window.location.reload();
  };

  return (
    <header className="w-full fixed top-0 z-50 backdrop-blur-md bg-white/70 border-b">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">

        {/* ================= LOGO ================= */}
        <a href="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-wide text-gray-800">
            Smart<span className="text-sky-500">Complaint</span>
          </h1>
        </a>

        {/* ================= NAVIGATION ================= */}
        <nav className="hidden md:flex items-center gap-2">

          {/* SERVICES */}
          <div className="group relative">
            <button className="px-4 py-2 rounded-md hover:bg-sky-100 flex items-center gap-1 duration-300">
              Services
              <i className="bi bi-chevron-down text-sm group-hover:rotate-180 duration-300"></i>
            </button>

            <div className="absolute left-0 mt-3 opacity-0 pointer-events-none translate-y-5 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 duration-300">
              <div className="bg-white border rounded-xl shadow-lg p-4">
                <ul className="flex gap-4">

                  <li>
                    <a className="w-64 block p-4 rounded-lg hover:bg-sky-50">
                      <p className="font-semibold">Complaint Tracking</p>
                      <span className="text-sm text-gray-500">
                        Track complaints in real-time.
                      </span>
                    </a>
                  </li>

                  <li>
                    <a className="w-64 block p-4 rounded-lg hover:bg-purple-50">
                      <p className="font-semibold">Analytics</p>
                      <span className="text-sm text-gray-500">
                        Smart complaint insights & reports.
                      </span>
                    </a>
                  </li>

                </ul>
              </div>
            </div>
          </div>

          <a href="#" className="px-4 py-2 rounded-md hover:bg-yellow-100">
            Resources
          </a>

          <a href="#" className="px-4 py-2 rounded-md hover:bg-green-100">
            Contact
          </a>
        </nav>

        {/* ================= AUTH AREA ================= */}
        {!user ? (
          <div className="flex gap-3">
            <a
              href="./Login"
              className="px-4 py-2 bg-black text-white rounded-md hover:opacity-80"
            >
              Login
            </a>

            <a
              href="/signup"
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Sign Up
            </a>
          </div>
        ) : (
          <div className="relative">
            <div
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <img
                src={user.profileImage || "https://i.pravatar.cc/40"}
                alt="profile"
                className="w-10 h-10 rounded-full border"
              />
              <span className="font-semibold">{user.name}</span>
            </div>

            {/* PROFILE DROPDOWN */}
            {open && (
              <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-xl border p-2">

                <a
                  href="/dashboard"
                  className="block px-4 py-2 rounded-md hover:bg-gray-100"
                >
                  Dashboard
                </a>

                <a
                  href="/profile"
                  className="block px-4 py-2 rounded-md hover:bg-gray-100"
                >
                  Profile
                </a>

                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 rounded-md hover:bg-red-100 text-red-500"
                >
                  Logout
                </button>

              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
