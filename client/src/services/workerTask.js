import { getToken } from "./auth";
const API = "http://localhost:5000/worker-tasks";
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

export const fetchWorkerTasks = async () => {
  try {
    const res = await fetch(API, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
    });
    const data = await handleResponse(res);
    return { success: true, workerTasks: data.workerTasks || data };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const createWorkerTask = async (taskData) => {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, message: "User not logged in" };
    }

    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(taskData)
    });

    const data = await handleResponse(res);
    return { success: true, workerTask: data.workerTask };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const updateWorkerTaskStatus = async (taskId, statusData) => {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, message: "User not logged in" };
    }

    const res = await fetch(`${API}/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(statusData)
    });

    const data = await handleResponse(res);
    return { success: true, workerTask: data.workerTask };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const getWorkerTasksByComplaint = async (complaintId) => {
  try {
    const res = await fetch(`${API}/complaint/${complaintId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
    });
    const data = await handleResponse(res);
    return { success: true, workerTasks: data.workerTasks || data };
  } catch (err) {
    return { success: false, message: err.message };
  }
};