const API = "http://localhost:5000/auth";

// Get JWT token from localStorage
const getToken = () => localStorage.getItem("user_token");

// Get auth header with JWT token
const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const loginUser = async (data) => {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (result.token) {
    localStorage.setItem("user_token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
  }
  return result;
};

export const registerUser = async (data) => {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (result.token) {
    localStorage.setItem("user_token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
  }
  return result;
};

export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API}/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    credentials: "include",
  });

  if (!res.ok) return null;
  return res.json();
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("user_token");
};

export const logout = () => {
  localStorage.removeItem("user_token");
  localStorage.removeItem("user");
};

// Legacy alias for backward compatibility
export const getMe = getCurrentUser;
