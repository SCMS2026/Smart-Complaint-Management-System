import { getToken } from "./auth";

const API = "http://localhost:5000/assets";

const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchAssets = async () => {
  try {
    const res = await fetch(API, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch assets");
    return { success: true, assets: data.assets };
  } catch (err) {
    return { success: false, message: err.message };
  }
};