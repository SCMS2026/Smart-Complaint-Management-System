import API_URL from './apiConfig.js';
import { getToken } from "./auth";

const API = `${API_URL}/assets`;

const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch all assets with optional filters
export const fetchAssets = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.city) queryParams.append('city', filters.city);
    if (filters.area) queryParams.append('area', filters.area);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.department_id) queryParams.append('department_id', filters.department_id);
    if (filters.search) queryParams.append('search', filters.search);

    const url = queryParams.toString() ? `${API}?${queryParams}` : API;

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to fetch assets");
    }
    
    const data = await res.json();
    return { success: true, assets: data.assets, count: data.count };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Fetch single asset by ID
export const fetchAssetById = async (assetId) => {
  try {
    const res = await fetch(`${API}/${assetId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to fetch asset");
    }
    
    const data = await res.json();
    return { success: true, asset: data.asset };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Admin functions (import)
export const importAssets = async (file) => {
  try {
    const form = new FormData();
    form.append('file', file);

    const token = getToken();
    const res = await fetch(`${API}/import`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
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

// Admin: create single asset
export const createAsset = async (assetData) => {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: 'include',
      body: JSON.stringify(assetData),
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

// Admin: update asset
export const updateAsset = async (assetId, assetData) => {
  try {
    const res = await fetch(`${API}/${assetId}`, {
      method: 'PUT',
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: 'include',
      body: JSON.stringify(assetData),
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to update asset');
    }
    
    const data = await res.json();
    return { success: true, asset: data.asset };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Admin: delete asset
export const deleteAsset = async (assetId) => {
  try {
    const res = await fetch(`${API}/${assetId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
      credentials: 'include',
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to delete asset');
    }
    
    const data = await res.json();
    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Get distinct values for filters
export const getAssetFilters = async () => {
  try {
    const res = await fetch(`${API}/filters`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      credentials: "include",
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to fetch filters");
    }
    
    const data = await res.json();
    return { success: true, filters: data.filters };
  } catch (err) {
    return { success: false, message: err.message };
  }
};