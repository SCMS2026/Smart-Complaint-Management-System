import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, googleSignIn } from "../services/auth";
import { useTheme } from "../context/ThemeContext";

const Login = () => {
  const nav = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser(form);
      if (res.success) {
        // 🔥 Persist auth token and user data for API calls
        const userData = { ...res.user, token: res.token };
        localStorage.setItem("user_token", res.token);
        localStorage.setItem("user", JSON.stringify(userData));
        nav("/profile");
      } else {
        setError(res.message || "Login failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let googleInitInterval;

    const initGoogle = () => {
      if (!window.google || !window.google.accounts?.id) return;

      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          const res = await googleSignIn(response.credential);
          if (res.success) {
            localStorage.setItem("user_token", res.token);
            localStorage.setItem("user", JSON.stringify({ ...res.user, token: res.token }));
            nav("/");
          } else {
            setError(res.message || "Google login failed");
          }
        },
      });

      google.accounts.id.renderButton(document.getElementById("googleSignInDiv"), {
        theme: "filled_blue",
        size: "large",
        width: "100%",
        shape: "rectangular",
        text: "signin_with",
      });
    };

    if (googleClientId) {
      if (window.google && window.google.accounts?.id) {
        initGoogle();
      } else {
        googleInitInterval = setInterval(() => {
          if (window.google && window.google.accounts?.id) {
            initGoogle();
            clearInterval(googleInitInterval);
          }
        }, 200);
      }
    }

    return () => {
      if (googleInitInterval) clearInterval(googleInitInterval);
    };
  }, [nav, googleClientId]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans selection:bg-blue-200 p-6" style={{ backgroundColor: 'var(--bg-main)' }}>

      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 -z-10" style={{ backgroundColor: theme === 'dark' ? '#1e293b' : undefined }}></div>
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

      <div className="w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row z-10 border relative backdrop-blur-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>

        {/* Left Side: Branding/Info */}
        <div className="w-full md:w-1/2 bg-linear-to-br from-blue-600 to-indigo-700 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Internal graphics */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-black opacity-10 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 text-white hover:opacity-80 transition-opacity mb-16">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="font-semibold tracking-wide">Back to Home</span>
            </Link>

            <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
              Welcome back to <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-200 to-indigo-200">SWAGAT</span>
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-sm">
              Your intelligent platform for managing and resolving complaints transparently and securely.
            </p>
          </div>

          {/* <div className="relative z-10 mt-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-indigo-700 bg-indigo-${i}00 flex items-center justify-center text-xs font-bold`}>
                    👩‍💼
                  </div>
                ))}
              </div>
              <div className="text-sm font-medium text-blue-100">
                Over <span className="text-white font-bold">10k+</span> users tracking issues.
              </div>
            </div>
          </div> */}
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-10 md:p-14 lg:p-16 backdrop-blur-xl flex flex-col justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="max-w-md w-full mx-auto">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>Sign In</h2>
              <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>Please enter your details to access your dashboard.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">

              <div className="space-y-1">
                <label className="text-sm font-semibold block" style={{ color: 'var(--text-main)' }}>Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-secondary)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold block" style={{ color: 'var(--text-main)' }}>Password</label>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-secondary)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl text-sm font-medium flex items-center gap-2" style={{ backgroundColor: theme === 'dark' ? '#450a0a' : '#fef2f2', color: theme === 'dark' ? '#fca5a5' : '#dc2626', borderColor: theme === 'dark' ? '#7f1d1d' : '#fecaca' }}>
                  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'var(--border-color)' }}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 font-medium" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>Or continue with</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                {/* The Google button rendered here */}
                <div id="googleSignInDiv" className="w-full flex justify-center [&>div]:w-full [&>div>div]:w-full transition-transform hover:-translate-y-0.5"></div>
              </div>
            </div>

            <p className="mt-8 text-center text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Don't have an account? <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline font-bold">Sign up</a>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;