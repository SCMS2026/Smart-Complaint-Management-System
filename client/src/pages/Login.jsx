import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";


const Login = () => {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate inputs
      if (!form.email || !form.password) {
        setError("Please enter both email and password");
        setLoading(false);
        return;
      }

      const res = await loginUser(form);
      console.log("Login response:", res);

      if (res.success) {
        console.log("Login successful, user:", res.user);
        console.log("Token stored:", localStorage.getItem("user_token"));
        console.log("User stored:", localStorage.getItem("user"));
        
        // Navigate to profile to verify data
        nav("/profile");
      } else {
        // Login failed - show error message
        setError(res.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

   return (
    <div className="min-h-screen flex bg-gray-100">
      {/* LEFT COMPANY HEADER */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white flex-col justify-between p-12">
        <div>
          <h1 className="text-4xl font-bold tracking-wide">Smart Complaint</h1>
          <p className="mt-2 text-white/80">Management System</p>
        </div>

        <div className="max-w-md">
          <h2 className="text-3xl font-semibold mb-4">
            Manage Complaints Smarter 🚀
          </h2>
          <p className="text-white/80 leading-relaxed">
            A modern platform designed to track, analyze, and resolve complaints
            efficiently with real-time insights and secure access.
          </p>
        </div>

        <div className="text-sm text-white/70">© 2026 SmartCMS Inc.</div>
      </div>

      {/* RIGHT LOGIN SECTION */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Sign in to your account
          </h2>

          <p className="text-center text-gray-500 mb-6 text-sm">
            Welcome back! Please enter your details.
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full mt-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full mt-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                required
              />
            </div>

            {error && (
              <div className="bg-red-100 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Google Button */}
            <a href="http://localhost:5000/auth/google" className="w-full">
              <button
                type="button"
                className="w-full py-3 border rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Login with Google
              </button>
            </a>

            <p className="text-center text-sm text-gray-500">
              Do not have an account?{" "}
              <a
                href="/signup"
                className="text-indigo-600 font-semibold hover:underline"
              >
                Sign up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );

};

export default Login;
