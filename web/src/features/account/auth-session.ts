import type { AuthResponse } from "./types";

const AUTH_TOKEN_STORAGE_KEY = "fitlog.authToken";
const AUTH_USER_STORAGE_KEY = "fitlog.user";
const AUTH_COOKIE_KEY = "fitlog_auth_token";
const DEFAULT_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export function persistAuthSession(response: AuthResponse) {
  const expiresAt = new Date(response.expiresAt).getTime();
  const maxAgeSeconds = Number.isFinite(expiresAt)
    ? Math.max(60, Math.floor((expiresAt - Date.now()) / 1000))
    : DEFAULT_MAX_AGE_SECONDS;

  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token);
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(response.user));
  document.cookie = `${AUTH_COOKIE_KEY}=${encodeURIComponent(response.token)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  document.cookie = `${AUTH_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getPersistedAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const storageToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (storageToken) {
    return storageToken;
  }

  const cookiePrefix = `${AUTH_COOKIE_KEY}=`;
  const authCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(cookiePrefix));

  return authCookie
    ? decodeURIComponent(authCookie.slice(cookiePrefix.length))
    : null;
}

export function updatePersistedNickname(nickname: string) {
  if (typeof window === "undefined") {
    return;
  }

  const rawUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
  if (!rawUser) {
    return;
  }

  try {
    const user = JSON.parse(rawUser) as { nickname?: string };
    localStorage.setItem(
      AUTH_USER_STORAGE_KEY,
      JSON.stringify({ ...user, nickname }),
    );
  } catch {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  }
}
