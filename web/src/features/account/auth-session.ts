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
