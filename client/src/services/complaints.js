import API_URL from './apiConfig.js';
import { getToken } from "./auth";
const API = `${API_URL}/complaints`;

const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return res.json();
};

export const fetchComplaints = async (filters = {}) => {
  try {
    // Build query string from filters object
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value);
        }
      }
    });

    const queryString = params.toString();
    const url = queryString ? `${API}?${queryString}` : API;

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
    });
    const data = await handleResponse(res);
    return { success: true, complaints: data.complaints, pagination: data.pagination };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const createComplaintRequest = async (complaintData) => {
  try {
    const token = getToken();

    if (!token) {
      return { success: false, message: "User not logged in. Please login again." };
    }

    const startTime = performance.now();
    console.log("🚀 Sending complaint data...");

    // Use AbortController for timeout (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: complaintData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`✅ Response received in ${duration}s`);

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Server Validation Error:", data);
      return { success: false, message: data.message || "Invalid complaint data." };
    }

    return { success: true, data };

  } catch (err) {
    if (err.name === 'AbortError') {
      return { success: false, message: "Request timeout. Please check your internet connection and try again." };
    }
    console.error("Complaint submission error:", err);
    return { success: false, message: "Cannot connect to server. Check your internet connection." };
  }
};

export const updateComplaintStatusRequest = async (id, status) => {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, message: "Authentication token missing. Please login again." };
    }

    console.log("Updating complaint status:", { complaintId: id, status });

    const res = await fetch(`${API}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
      body: JSON.stringify({ status }),
    });

    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      console.error("Status update failed:", { status: res.status, response: data });
      throw new Error(data.message || `Request failed (${res.status})`);
    }
    
    console.log("Status update successful:", data);
    return { success: true, complaint: data.complaint };
  } catch (err) {
    console.error("updateComplaintStatusRequest error:", err.message);
    return { success: false, message: err.message };
  }
};

export const deleteComplaintRequest = async (id) => {
  try {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
    });
    await handleResponse(res);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const getComplaintById = async (id) => {
  try {
    const res = await fetch(`${API}/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
    });
    const data = await handleResponse(res);
    return { success: true, complaint: data.complaint };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const addCommentToComplaint = async (id, text) => {
  try {
    const res = await fetch(`${API}/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
      body: JSON.stringify({ text }),
    });
    const data = await handleResponse(res);
    return { success: true, complaint: data.complaint };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const markComplaintAsFake = async (id) => {
  try {
    const res = await fetch(`${API}/${id}/fake`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
    });
    const data = await handleResponse(res);
    return { success: true, complaint: data.complaint };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const fetchComplaintAnalytics = async () => {
  try {
    const res = await fetch(`${API}/analytics`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
    });
    const data = await handleResponse(res);
    return { success: true, analytics: data };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const userApproveComplaintRequest = async (id, action) => {
  try {
    const res = await fetch(`${API}/${id}/user-approval`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
      body: JSON.stringify({ action }),
    });
    const data = await handleResponse(res);
    return { success: true, complaint: data.complaint };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
// PUBLIC tracking — no auth needed
export const trackComplaintById = async (complaintId) => {
  try {
    const res = await fetch(`${API}/track/${complaintId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Tracking failed");
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// PUBLIC search by name / issue / location — no auth needed
export const searchComplaintsPublic = async (query) => {
  try {
    const res = await fetch(`${API}/search/public?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Search failed");
    return { success: true, results: data.results, total: data.total };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Worker Tasks for Complaint - Re-export for convenience
export { getWorkerTasksByComplaint } from './workerTask.js';
export { getWorkerTasksByComplaint as getWorkerTasksForComplaint } from './workerTask.js';