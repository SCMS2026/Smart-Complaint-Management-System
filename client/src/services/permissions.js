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
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch permissions");
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create permission");
    return { success: true, permission: data.permission };
  } catch (err) {
    return { success: false, message: err.message };
  }
};