import { getToken } from "./auth";
const API = "http://localhost:5000/complaints";

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

export const fetchComplaints = async () => {
  try {
    const res = await fetch(API, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
    });
    const data = await handleResponse(res);
    return { success: true, complaints: data.complaints };
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
console.log("Sending complaint data:", complaintData);
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(complaintData),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Log the specific error from the server to identify the missing/invalid field
      console.error("Server Validation Error:", data);
      return { success: false, message: data.message || "Invalid complaint data." };
    }

    return { success: true, data };

  } catch (err) {
    // Network error — server unreachable
    return { success: false, message: "Cannot connect to server. Check your internet connection." };
  }
};

export const updateComplaintStatusRequest = async (id, status) => {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, message: "Authentication token missing. Please login again." };
    }

    const res = await fetch(`${API}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
      body: JSON.stringify({ status }),
    });

    const data = await handleResponse(res);
    return { success: true, complaint: data.complaint };
  } catch (err) {
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