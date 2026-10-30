const DEFAULT_API_ORIGIN = "http://localhost:3000";

function normalizeApiOrigin(value) {
  const trimmed = (value ?? DEFAULT_API_ORIGIN).trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed.slice(0, -4) : trimmed;
}

const apiOrigin = normalizeApiOrigin(import.meta.env.VITE_API_URL);

export const API_BASE_URL = apiOrigin ? `${apiOrigin}/api` : "/api";

export function apiUrl(path) {
  const normalizedPath = `/${String(path).replace(/^\/+/, "")}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function apiFetch(path, options = {}) {
  return fetch(apiUrl(path), {
    ...options,
    credentials: "include",
  });
}
