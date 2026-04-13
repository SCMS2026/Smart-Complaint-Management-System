import { useEffect, useState } from "react";
import { getMe, logout } from "../services/auth";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Try localStorage first (set by login/register or Google handlers)
    const local = localStorage.getItem("user");
    if (local) {
      try {
        setUser(JSON.parse(local));
        return;
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }

    getMe().then((data) => {
      if (!data) return;
      if (data.user) setUser(data.user);
      else setUser(data);
    });
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => setMobileMenuOpen(false);
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
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
      <div className="backdrop-blur-xl shadow-sm" style={{ backgroundColor: 'var(--nav-bg)' }}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* ================= LOGO ================= */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
              SC
            </div>

            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
              Smart
              <span className="text-sky-500 group-hover:text-indigo-600 transition">
                Complaint
              </span>
            </h1>
          </a>

          {/* ================= NAV ================= */}
          <nav className="hidden md:flex items-center gap-2 font-medium" style={{ color: 'var(--text-main)' }}>

            {/* SERVICES */}
            <div className="relative group">
              <button className="px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-black/5 dark:hover:bg-white/10 transition">
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
              <div className="absolute left-0 mt-4 w-72 border rounded-2xl shadow-xl opacity-0 invisible translate-y-4 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div className="p-4 space-y-3">

                  <a className="block p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
                    <p className="font-semibold" style={{ color: 'var(--text-main)' }}>
                      Complaint Tracking
                    </p>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Track complaints in real-time
                    </span>
                  </a>

                  <a className="block p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
                    <p className="font-semibold" style={{ color: 'var(--text-main)' }}>
                      Analytics
                    </p>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Smart insights & reports
                    </span>
                  </a>

                </div>
              </div>
            </div>

            <a
              href="#"
              className="px-4 py-2 rounded-lg hover:bg-black/5 transition cursor-pointer"
            >
              Resources
            </a>

            {user && (
              <a
                href="/company"
                className="px-4 py-2 rounded-lg hover:bg-black/5 transition cursor-pointer"
              >
                Company
              </a>
            )}

            <a
              href="#"
              className="px-4 py-2 rounded-lg hover:bg-black/5 transition cursor-pointer"
            >
              Contact
            </a>

            {user && user.role === 'admin' && (
              <a
                href="/admin"
                className="px-4 py-2 rounded-lg hover:bg-black/5 transition cursor-pointer"
              >
                Admin
              </a>
            )}
            {user && user.role === 'department_admin' && (
              <a
                href="/department-admin"
                className="px-4 py-2 rounded-lg hover:bg-black/5 transition cursor-pointer"
              >
                Department Admin
              </a>
            )}
            {user && user.role === 'super_admin' && (
              <a
                href="/super-admin"
                className="px-4 py-2 rounded-lg hover:bg-black/5 transition cursor-pointer"
              >
                Super Admin
              </a>
            )}
            {user && user.role === 'analyzer' && (
              <a
                href="/analyzer"
                className="px-4 py-2 rounded-lg hover:bg-black/5 transition cursor-pointer"
              >
                Analytics
              </a>
            )}
            {(user && (user.role === 'contractor' || user.role === 'worker')) && (
              <a
                href="/contractor"
                className="px-4 py-2 rounded-lg hover:bg-black/5 transition cursor-pointer"
              >
                Contractor
              </a>
            )}
          </nav>

          {/* ================= MOBILE MENU TOGGLE ================= */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
            style={{ color: 'var(--text-main)' }}
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* ================= THEME TOGGLE ================= */}
          <button
            type="button"
            onClick={toggleTheme}
            className="px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2 border hover:bg-black/5 dark:hover:bg-white/10"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)'
            }}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1111.79 3 7 7 0 0021 12.79z" />
                </svg>
                <span className="text-sm font-medium">Dark</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
                <span className="text-sm font-medium">Light</span>
              </>
            )}
          </button>

          {/* ================= AUTH ================= */}
          {!user ? (
            <div className="flex items-center gap-3">
              <a
                href="/login"
                className="px-4 py-2 rounded-xl hover:bg-black/5 transition font-medium"
                style={{ color: 'var(--text-main)' }}
              >
                Login
              </a>

              <a
                href="/signup"
                className="px-5 py-2.5 rounded-xl bg-linear-to-r from-sky-500 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition"
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
                  className="w-10 h-10 rounded-full border"
                  style={{ borderColor: 'var(--border-color)' }}
                />
                <span className="font-semibold" style={{ color: 'var(--text-main)' }}>
                  {user.name || user.displayName || user.email}
                </span>
              </button>

              {/* Profile Dropdown */}
              <div
                className={`absolute right-0 mt-3 w-56 rounded-2xl shadow-xl border p-2 transition-all duration-300 cursor-pointer ${open
                  ? "opacity-100 translate-y-0 visible"
                  : "opacity-0 -translate-y-3 invisible"
                  }`}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)'
                }}
              >
                {/* compute dashboard path based on role */}
                <a
                  href={
                    user.role === 'super_admin' ? '/super-admin' :
                      user.role === 'department_admin' ? '/department-admin' :
                        user.role === 'admin' ? '/admin' :
                          user.role === 'analyzer' ? '/analyzer' :
                            user.role === 'contractor' ? '/contractor' :
                              '/profile'
                  }
                  className="block px-4 py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
                  style={{ color: 'var(--text-main)' }}
                >
                  Dashboard
                </a>

                <a
                  href="/profile"
                  className="block px-4 py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
                  style={{ color: 'var(--text-main)' }}
                >
                  Profile
                </a>

                <a
                  href="/complaint"
                  className="block px-4 py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
                  style={{ color: 'var(--text-main)' }}
                >
                  Complaints
                </a>

                <div className="h-px my-2" style={{ backgroundColor: 'var(--border-color)' }}></div>

                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition text-red-500"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--border-color)' }}>
          <div className="px-6 py-4 space-y-2">
            {/* SERVICES */}
            <div className="space-y-2">
              <div className="font-medium px-3 py-2" style={{ color: 'var(--text-main)' }}>Services</div>
              <a href="#" className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setMobileMenuOpen(false)}>
                Complaint Tracking
              </a>
              <a href="#" className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setMobileMenuOpen(false)}>
                Analytics
              </a>
            </div>

            <div className="border-t" style={{ borderColor: 'var(--border-color)' }}></div>

            <a href="#" className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setMobileMenuOpen(false)}>
              Resources
            </a>

            {user && (
              <a href="/company" className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setMobileMenuOpen(false)}>
                Company
              </a>
            )}

            <a href="#" className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setMobileMenuOpen(false)}>
              Contact
            </a>

            {user && user.role === 'admin' && (
              <a href="/admin" className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setMobileMenuOpen(false)}>
                Admin
              </a>
            )}
            {user && user.role === 'department_admin' && (
              <a href="/department-admin" className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setMobileMenuOpen(false)}>
                Department Admin
              </a>
            )}
            {user && user.role === 'super_admin' && (
              <a href="/super-admin" className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setMobileMenuOpen(false)}>
                Super Admin
              </a>
            )}
            {user && user.role === 'analyzer' && (
              <a href="/analyzer" className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setMobileMenuOpen(false)}>
                Analytics
              </a>
            )}
            {(user && (user.role === 'contractor' || user.role === 'worker')) && (
              <a href="/contractor" className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setMobileMenuOpen(false)}>
                Contractor
              </a>
            )}

            {/* ================= MOBILE AUTH ================= */}
            {!user && (
              <>
                <div className="border-t" style={{ borderColor: 'var(--border-color)' }}></div>
                <div className="space-y-3 pt-2">
                  <a
                    href="/login"
                    className="block w-full px-3 py-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition font-medium text-center cursor-pointer"
                    style={{ color: 'var(--text-main)' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </a>

                  <a
                    href="/signup"
                    className="block w-full px-3 py-3 rounded-lg bg-linear-to-r from-sky-500 to-indigo-600 text-white font-semibold text-center shadow-md hover:shadow-lg transition cursor-pointer"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;