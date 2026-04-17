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
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to fetch assets");
    }
    const data = await res.json();
    return { success: true, assets: data.assets };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const importAssets = async (file) => {
  try {
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(`${getAPI()}/import`, {
      method: 'POST',
      headers: { ...getAuthHeader() }, // omit content-type so browser sets boundary
      credentials: 'include',
      body: form,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to import assets');
    }
    const data = await res.json();
    return { success: true, ...data };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const createAsset = async ({ name, location, category }) => {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: 'include',
      body: JSON.stringify({ name, location, category }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to create asset');
    }
    const data = await res.json();
    return { success: true, asset: data.asset };
  } catch (err) {
    return { success: false, message: err.message };
  }
};