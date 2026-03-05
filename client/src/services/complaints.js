import { getToken } from "./auth";

const API = "http://localhost:5000/complaints";

const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchComplaints = async () => {
  try {
    const res = await fetch(API, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch complaints");
    return { success: true, complaints: data.complaints };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const createComplaintRequest = async (complaint) => {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
      body: JSON.stringify(complaint),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create complaint");
    return { success: true, complaint: data.complaint };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const updateComplaintStatusRequest = async (id, status) => {
  try {
    const res = await fetch(`${API}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update status");
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete complaint");
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch complaint");
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to add comment");
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to mark as fake");
    return { success: true, complaint: data.complaint };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
