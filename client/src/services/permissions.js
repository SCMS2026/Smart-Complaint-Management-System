import { getToken } from "./auth";

const API = "http://localhost:5000/permissions";

const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchPermissions = async () => {
  try {
    const res = await fetch(API, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to fetch permissions");
    }
    const data = await res.json();
    return { success: true, permissions: data.permissions };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const createPermissionRequest = async (permission) => {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
      body: JSON.stringify(permission),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to create permission");
    }
    const data = await res.json();
    return { success: true, permission: data.permission };
  } catch (err) {
    return { success: false, message: err.message };
  }
};