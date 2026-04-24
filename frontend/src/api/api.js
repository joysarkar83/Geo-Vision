const API = "http://localhost:3000";

/* ======================
   AUTH
====================== */

export async function signup(data) {

  const res = await fetch(`${API}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function login(data) {

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function getCurrentUser() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/me`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  return res.json();
}

/* ======================
   LAND
====================== */

export async function getLands() {

  const res = await fetch(`${API}/land`);

  return res.json();
}

export async function getLand(id) {

  const res = await fetch(`${API}/land/${id}`);

  return res.json();
}

export async function getMyLands() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/land/mine`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  return res.json();
}

export async function updateLand(id, data) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/land/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function deleteLand(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/land/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  return res.json();
}

export async function getPendingLands() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/land/pending`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  return res.json();
}

export async function verifyLand(landId) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/land/${landId}/verify`, {
    method: "PATCH",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  return res.json();
}

export async function rejectLandVerification(landId, reason) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/land/${landId}/reject`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ reason }),
  });

  return res.json();
}

/* ======================
   REQUESTS
====================== */

export async function sendContactRequest(landId) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/request/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ landId }),
  });

  return res.json();
}

export async function checkRequestStatus(landId) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/request/check/${landId}`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  return res.json();
}

export async function getMyRequests() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/request/my`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  return res.json();
}

export async function approveRequest(requestId) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/request/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ requestId }),
  });

  return res.json();
}

export async function rejectRequest(requestId, reason) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/request/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ requestId, reason }),
  });

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

/* ======================
   DOCUMENT UPLOAD
====================== */

export async function uploadDocs(files) {

  const token = localStorage.getItem("token");

  const formData = new FormData();

  files.forEach(file => formData.append("documents", file));

  const res = await fetch(`${API}/land/upload-docs`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token
    },
    body: formData
  });

  return res.json();
}
