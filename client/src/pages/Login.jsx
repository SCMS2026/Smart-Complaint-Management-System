import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, googleSignIn } from "../services/auth";

const Login = () => {
  const nav = useNavigate();
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
        // 🔥 ડેટા સેવ કરવો ફરજિયાત છે
        const userData = { ...res.user, token: res.token };
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
    if (window.google && googleClientId) {
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          const res = await googleSignIn(response.credential);
          if (res.success) {
            localStorage.setItem("user", JSON.stringify({ ...res.user, token: res.token }));
            nav("/");
          }
        },
      });
      google.accounts.id.renderButton(document.getElementById("googleSignInDiv"), { theme: "outline", size: "large", width: "100%" });
    }
  }, [nav, googleClientId]);

  return (
    <div className="min-h-screen flex bg-gray-100 items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Sign in to SWAGAT</h2>
        <form onSubmit={onSubmit} className="space-y-5">
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full p-3 border rounded-lg" required />
          <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" className="w-full p-3 border rounded-lg" required />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold">
            {loading ? "Logging in..." : "Login"}
          </button>
          <div id="googleSignInDiv" className="w-full"></div>
        </form>
      </div>
    </div>
  );
};

export default Login;