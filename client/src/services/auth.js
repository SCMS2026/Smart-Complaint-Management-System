const API = "http://localhost:5000/api/auth";

export const loginUser = async (data) => {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return res.json();
};

export const registerUser = async (data) => {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return res.json();
};

export const getMe = async () => {
  const res = await fetch(`${API}/me`, {
    credentials: "include",
  });

  return res.json();
};
