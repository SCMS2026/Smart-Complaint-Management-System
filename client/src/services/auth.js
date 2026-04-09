const API = "http://localhost:5000/auth";

// Get JWT token from localStorage
export const getToken = () => {
  const token = localStorage.getItem("user_token");
  if (token && token.startsWith("Bearer ")) {
    // Remove "Bearer " prefix if it exists
    return token.substring(7);
  }
  return token;
};

// Decode JWT token to inspect its claims (for debugging)
export const getTokenPayload = () => {
  const token = getToken();
  if (!token) {
    console.error("❌ No token found!");
    return null;
  }
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("❌ Invalid token format - expected 3 parts, got", parts.length);
      return null;
    }
    const payload = JSON.parse(atob(parts[1]));
    console.log("✅ Token Payload:", payload);
    console.log("   Role in token:", payload.role);
    console.log("   User ID:", payload.id);
    return payload;
  } catch (err) {
    console.error("❌ Failed to decode token:", err.message);
    return null;
  }
};

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

export const createUser = async (userData) => {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, message: "User not logged in" };
    }

    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || "Failed to create user" };
    }

    return { success: true, user: data.user };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const fetchUsers = async () => {
  try {
    const token = getToken();
    if (!token) return { success: false, message: "Not authenticated" };

    const res = await fetch(`${API}/admin/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, message: data.message || "Failed to fetch users" };
    }

    const data = await res.json();
    return { success: true, users: data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const setUserRole = async (id, role, department_id) => {
  try {
    const token = getToken();
    if (!token) return { success: false, message: "Not authenticated" };

    const body = { role };
    if (department_id) body.department_id = department_id;

    const res = await fetch(`${API}/admin/users/${id}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data.message || "Failed to update role" };
    }

    return { success: true, user: data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Legacy alias for backward compatibility
export const getMe = getCurrentUser;

export const updateProfile = async (profileData) => {
  const token = getToken();
  if (!token) return { success: false, message: "Not authenticated" };

  try {
    const res = await fetch(`${API}/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(profileData),
    });
    const result = await res.json();
    // debug line removed
    if (!res.ok) {
      return { success: false, message: result.message || "Profile update failed" };
    }
    return { success: true, message: result.message || "Profile updated successfully", user: result.user };
  } catch (error) { 
    return { success: false, message: error.message || "An error occurred during profile update" };
  }
};

// Google sign-in: send ID token to server and receive our JWT
export const googleSignIn = async (idToken) => {
  try {
    const res = await fetch(`${API}/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token: idToken }),
    });

    const result = await res.json();
    if (!res.ok) {
      return { success: false, message: result.message || "Google login failed" };
    }
    if (result.token) {
      localStorage.setItem("user_token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
    }
    return { success: true, token: result.token, user: result.user };
  } catch (error) {
    return { success: false, message: error.message || "An error occurred during Google login" };
  }
};
