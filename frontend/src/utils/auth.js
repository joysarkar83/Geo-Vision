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

  return payload.email || null;

}

export function getUsername() {

  const token = getToken();
  const payload = parseJwt(token);

  if (payload?.username) return payload.username;

  if (typeof window === "undefined") return null;

  return localStorage.getItem("username");

}

export function getUserId() {

  const token = getToken();
  const payload = parseJwt(token);

  if (!payload) return null;

  return payload.id || null;

}

export function getUserRole() {

  const token = getToken();
  const payload = parseJwt(token);

  if (!payload) return null;

  return payload.role || "user";

}

export function logout() {

  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("username");

}
