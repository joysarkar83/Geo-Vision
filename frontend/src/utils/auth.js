export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function isLoggedIn() {
  return !!getToken();
}

function parseJwt(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getUserEmail() {
  const token = getToken();
  const payload = parseJwt(token);
  if (!payload) return null;
  return payload.email || payload.username || payload.sub || null;
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  window.location.href = "/";
}

