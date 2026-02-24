const API = "http://localhost:5000/auth";

// Get JWT token from localStorage
export const getToken = () => localStorage.getItem("user_token");

// Get auth header with JWT token
const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const loginUser = async (data) => {
  try {
    // Validate input
    if (!data.email || !data.password) {
      return {
        success: false,
        message: "Email and password are required",
        token: null,
        user: null,
      };
    }

    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: result.message || "Login failed",
        token: null,
        user: null,
      };
    }

    // Store token and user data on successful login
    if (result.token) {
      localStorage.setItem("user_token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
    }

    return {
      success: true,
      message: result.message || "Login successful",
      token: result.token,
      user: result.user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "An error occurred during login",
      token: null,
      user: null,
    };
  }
};

export const registerUser = async (data) => {
  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await res.json();
    console.log("Register response:", result);
    
    if (!res.ok) {
      return {
        success: false,
        message: result.message || "Registration failed",
        token: null,
        user: null,
      };
    }

    if (result.token) {
      localStorage.setItem("user_token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
    }
    
    return {
      success: true,
      message: result.message || "Registration successful",
      token: result.token,
      user: result.user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "An error occurred during registration",
      token: null,
      user: null,
    };
  }
};

export const getCurrentUser = async () => {
  const token = getToken();
  console.log("getCurrentUser called, token:", token);
  if (!token) return null;

  try {
    const res = await fetch(`${API}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    console.log("getCurrentUser response status:", res.status);
    
    if (!res.ok) {
      console.error("getCurrentUser failed with status:", res.status);
      const errorData = await res.json();
      console.error("Error response:", errorData);
      return null;
    }
    
    const data = await res.json();
    console.log("getCurrentUser success:", data);
    return data;
  } catch (err) {
    // Network error (server down / connection refused)
    console.warn("getCurrentUser failed:", err);
    return null;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("user_token");
};

export const logout = () => {
  localStorage.removeItem("user_token");
  localStorage.removeItem("user");
  window.location.reload();
};

// Legacy alias for backward compatibility
export const getMe = getCurrentUser;
