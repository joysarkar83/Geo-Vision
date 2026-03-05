const API = "http://localhost:3000";

export async function signup(data) {
  return fetch(`${API}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function login(data) {
  return fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function getLands() {
  const res = await fetch(`${API}/land`);
  return res.json();
}

export async function getLand(id) {
  const res = await fetch(`${API}/land/${id}`);
  return res.json();
}

export async function addLand(data) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/land/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(data)
  });

  return res.json();
}