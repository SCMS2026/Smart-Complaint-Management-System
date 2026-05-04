import { useEffect, useState } from "react";
import { getMe, logout } from "../services/auth";
import { getUnreadCount, markAsRead, markAllAsRead } from "../services/notifications";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
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

  // Fetch unread count
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      const { unreadCount: count } = await getUnreadCount();
      setUnreadCount(count?.unreadCount || 0);
    };
    fetchUnread();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // When notification dropdown opens, load recent notifications
  useEffect(() => {
    if (notifOpen) {
      loadNotifications();
    }
  }, [notifOpen]);

  const loadNotifications = async () => {
    const data = await getNotifications(1, 10, false);
    setNotifications(data.notifications || []);
  };

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

                   <a href="/track" className="block p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
                     <p className="font-semibold" style={{ color: 'var(--text-main)' }}>
                       Complaint Tracking
                     </p>
                     <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                       Track complaints in real-time
                     </span>
                   </a>

                   <a href="/analytics" className="block p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
                     <p className="font-semibold" style={{ color: 'var(--text-main)' }}>
                       Analytics
                     </p>
                     <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                       Smart insights & reports
                     </span>
                   </a>

                   <a href="/contact" className="block p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
                     <p className="font-semibold" style={{ color: 'var(--text-main)' }}>
                       Contact Us
                     </p>
                     <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                       Get in touch with our team
                     </span>
                   </a>

                 </div>
              </div>
            </div>

            <a
              href="/resources"
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
              href="/complaint"
              className="px-4 py-2 rounded-lg hover:bg-black/5 transition cursor-pointer"
            >
              Complaints
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

          {/* ================= NOTIFICATIONS ================= */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                aria-label="Toggle notifications"
              >
                <svg className="w-5 h-5" style={{ color: 'var(--text-main)' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto rounded-2xl shadow-xl border p-0 z-50 transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>Notifications</h3>
                    <div className="flex gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={async () => {
                            await markAllAsRead();
                            setUnreadCount(0);
                            setNotifications(notifications.map(n => ({ ...n, read: true })));
                          }}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
                        style={{ color: 'var(--text-main)' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif._id}
                          className={`p-3 border-b transition cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                          style={{ borderColor: 'var(--border-color)' }}
                          onClick={async () => {
                            if (!notif.read) {
                              await markAsRead(notif._id);
                              setUnreadCount(prev => Math.max(0, prev - 1));
                            }
                            window.location.href = notif.actionUrl || '/';
                            setNotifOpen(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {notif.sender?.name?.charAt(0) || 'S'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-main)' }}>
                                {notif.title}
                              </p>
                              <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                {notif.message}
                              </p>
                              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 5 && (
                    <div className="p-3 border-t text-center">
                      <a
                        href="/notifications"
                        className="text-xs text-blue-600 hover:underline"
                        style={{ color: 'var(--text-main)' }}
                      >
                        View all notifications
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/5 transition cursor-pointer"
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
                className={`absolute right-0 mt-3 w-56 rounded-2xl shadow-xl border p-2 transition-all duration-300 ${open
                  ? "opacity-100 translate-y-0 visible"
                  : "opacity-0 -translate-y-3 invisible"
                  }`}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)',
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
                  className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition text-red-500 cursor-pointer"
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
               <a href="/track" className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setMobileMenuOpen(false)}>
                 Complaint Tracking
               </a>
               <a href="/analytics" className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setMobileMenuOpen(false)}>
                 Analytics
               </a>
               <a href="/contact" className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setMobileMenuOpen(false)}>
                 Contact Us
               </a>
             </div>

            <div className="border-t" style={{ borderColor: 'var(--border-color)' }}></div>

            <a href="/resources" className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setMobileMenuOpen(false)}>
              Resources
            </a>

             {user && (
               <a href="/company" className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setMobileMenuOpen(false)}>
                 Company
               </a>
             )}

             <a href="/complaint" className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setMobileMenuOpen(false)}>
               Complaints
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

             {/* LEGAL LINKS */}
             <div className="border-t" style={{ borderColor: 'var(--border-color)' }}></div>
             <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Legal</div>
             <a href="/privacy-policy" className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setMobileMenuOpen(false)}>
               Privacy Policy
             </a>
             <a href="/terms-of-service" className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setMobileMenuOpen(false)}>
               Terms of Service
             </a>
             <a href="/accessibility" className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer" style={{ color: 'var(--text-main)' }} onClick={() => setMobileMenuOpen(false)}>
               Accessibility
             </a>

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