import { getToken } from "./auth";
const API = "http://localhost:5000/complaints";
const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Request failed");
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
    const token =getToken();
    console.log("createComplaintRequest called with data:", complaintData, "token:", token);
  
    if (!token) {
      console.error("Token missing. Please login again.");
      return { success: false, message: "User not logged in" };
    }

    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(complaintData)
    });
      
    console.log("Response from create complaint API:", res);
    const data = await res.json();

    if (!res.ok) {
      console.error("Token invalid or expired");
      return { success: false, message: data.message || "Unauthorized" };
    }

    console.log("Complaint created successfully:", data);
    return { success: true, complaint: data };

  } catch {
    return { success: false, message: "Server connection failed" };
  }
};

export const updateComplaintStatusRequest = async (id, status) => {
  try {
    const token = getToken();
    if (!token) {
      console.error("❌ No token found in localStorage");
      return { success: false, message: "Authentication token missing. Please login again." };
    }

    console.log("📤 Sending PATCH request with token:", token.substring(0, 20) + "...");
    const res = await fetch(`${API}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    
    console.log("📥 Response status:", res.status);
    const data = await handleResponse(res);
    return { success: true, complaint: data.complaint };
  } catch (err) {
    console.error("❌ updateComplaintStatusRequest error:", err.message);
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
      body: JSON.stringify({ action })
    });
    const data = await handleResponse(res);
    return { success: true, complaint: data.complaint };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
