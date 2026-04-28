import API_URL from './apiConfig.js';
import { getToken } from "./auth";

const API = `${API_URL}/permissions`;

const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all permissions (admin only)
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

// Get current contractor's permission requests
export const fetchMyPermissions = async () => {
  try {
    const res = await fetch(`${API}/my-requests`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to fetch permission requests");
    }
    
    const data = await res.json();
    return { success: true, permissions: data.permissions };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Get single permission by ID
export const fetchPermissionById = async (permissionId) => {
  try {
    const res = await fetch(`${API}/${permissionId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to fetch permission");
    }
    
    const data = await res.json();
    return { success: true, permission: data.permission };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Create a new permission request
export const createPermissionRequest = async (permissionData) => {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
      body: JSON.stringify(permissionData),
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to create permission request");
    }
    
    const data = await res.json();
    return { success: true, permission: data.permission };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Update permission status (approve/reject) - Admin only
export const updatePermissionStatus = async (permissionId, status, reviewComments) => {
  try {
    const res = await fetch(`${API}/${permissionId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
      body: JSON.stringify({ status, reviewComments }),
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to update permission status");
    }
    
    const data = await res.json();
    return { success: true, permission: data.permission };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Mark permission as completed
export const completePermission = async (permissionId, completionNotes) => {
  try {
    const res = await fetch(`${API}/${permissionId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
      body: JSON.stringify({ completionNotes }),
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to complete permission");
    }
    
    const data = await res.json();
    return { success: true, permission: data.permission };
  } catch (err) {
    return { success: false, message: err.message };
  }
};