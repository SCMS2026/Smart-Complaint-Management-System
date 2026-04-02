import { getToken } from "./auth";
import axios from "axios";
const API = "http://localhost:5000/departments";
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

export const fetchDepartments = async () => {
  try {
    const res = await fetch(API, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
    });
    const data = await handleResponse(res);
    return { success: true, departments: data.departments || data };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const createDepartment = async (departmentData) => {
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
      body: JSON.stringify(departmentData)
    });

    const data = await handleResponse(res);
    return { success: true, department: data.department };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const updateDepartment = async (departmentId, departmentData) => {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, message: "User not logged in" };
    }

    const res = await fetch(`${API}/${departmentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(departmentData)
    });

    const data = await handleResponse(res);
    return { success: true, department: data.department };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const deleteDepartment = async (departmentId) => {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, message: "User not logged in" };
    }

    const res = await fetch(`${API}/${departmentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    const data = await handleResponse(res);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
};