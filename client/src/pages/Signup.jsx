import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth";

const Signup = () => {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError(""); // Clear error on input change
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!form.email.includes("@")) {
      setError("Valid email is required");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      if (res.token) {
        setSuccess("✓ Account created successfully! Redirecting...");
        setTimeout(() => {
          nav("/");
        }, 1500);
      } else {
        setError(res.message || "Signup failed");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.post("http://localhost:5000/auth/google", {
          access_token: tokenResponse.access_token,
        });

        console.log(res.data);
      } catch (err) {
        console.log(err);
      }
    },
    onError: () => console.log("Login Failed"),
  });

  return (
    <div className="min-h-screen flex bg-[#0B0F19] text-white font-sans selection:bg-indigo-500/30">
      {/* LEFT SIDE - BRANDING & FEATURES */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-b from-indigo-900/20 to-[#0B0F19] border-r border-white/5 flex-col justify-between p-12">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen animate-pulse"></div>
          <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[100px] mix-blend-screen" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
          <div className="absolute -bottom-[20%] left-[10%] w-[80%] h-[80%] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen"></div>
        </div>

        {/* Logo & Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-white/10">
              <span className="text-xl font-black text-white tracking-widest">SC</span>
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              SmartCMS
            </span>
          </div>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight">
            Start solving <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              complaints faster.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-md leading-relaxed">
            Experience the next generation of complaint management. AI-driven insights, real-time tracking, and seamless resolution all in one unified platform.
          </p>
        </div>

        {/* Feature List */}
        <div className="relative z-10 space-y-8 my-12">
          {[
            { title: "Real-time Tracking", desc: "Monitor complaint status instantly", icon: "📍" },
            { title: "AI Analytics", desc: "Smart insights for better decisions", icon: "🧠" },
            { title: "Enterprise Security", desc: "Bank-grade data protection", icon: "🛡️" }
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-5 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex flex-shrink-0 items-center justify-center text-xl group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-all duration-300 shadow-lg">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1 group-hover:text-indigo-300 transition-colors">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-4 text-sm text-slate-500">
          <span>© 2026 SmartCMS Inc.</span>
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3 text-white">Create an account</h2>
            <p className="text-slate-400">Enter your details to get started.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all duration-300"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all duration-300"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all duration-300 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all duration-300"
                required
              />
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm py-2.5 px-4 rounded-xl flex items-center gap-3 animate-pulse">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-400 text-sm py-2.5 px-4 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">or sign up with</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <button
              type="button"
              onClick={() => login()}
              className="w-full py-3.5 bg-[#1A1F2E] hover:bg-[#252B3D] border border-white/10 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                viewBox="0 0 24 24"
              >
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>

            {/* Login Link */}
            <p className="text-center text-slate-400 mt-8">
              Already have an account?{" "}
              <a href="/login" className="text-white font-semibold hover:text-indigo-400 transition-colors">
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
