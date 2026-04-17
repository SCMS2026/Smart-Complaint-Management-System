import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../services/apiConfig";
import { registerUser } from "../services/auth";
import { useTheme } from "../context/ThemeContext";

const Signup = () => {
  const nav = useNavigate();
  const { theme } = useTheme();
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
        // persist token/user (registerUser also does this)
        localStorage.setItem("user_token", res.token);
        if (res.user) localStorage.setItem("user", JSON.stringify(res.user));

        setSuccess("✓ Account created successfully!");
        nav("/");
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

  const handleSuccess = async (credentialResponse) => {
    const res = await axios.post(`${API_URL}/auth/google`, {
      token: credentialResponse.credential,
    });

    // Persist using the same keys as other auth flows
    if (res.data?.token) localStorage.setItem("user_token", res.data.token);
    if (res.data?.user) localStorage.setItem("user", JSON.stringify(res.data.user));
    else if (res.data) localStorage.setItem("user", JSON.stringify(res.data));

    console.log(res.data);
    nav('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>Create an account</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Enter your details to get started.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-3 py-2 rounded-lg border"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@company.com"
              className="w-full px-3 py-2 rounded-lg border"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg border"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg border"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm py-2 px-3 rounded-lg bg-red-50 border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-500 text-sm py-2 px-3 rounded-lg bg-green-50 border border-green-200">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="text-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => console.log("Login Failed")}
            />
          </div>

          <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{" "}
            <a href="/login" className="font-semibold hover:text-indigo-400 transition-colors" style={{ color: 'var(--text-main)' }}>
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
