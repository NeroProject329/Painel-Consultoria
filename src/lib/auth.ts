const TOKEN_KEY = "tn_token";
const AUTH_EVENT = "tn_auth_changed";
let fallbackToken: string | null = null;

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(TOKEN_KEY); }
  catch { return fallbackToken; }
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  fallbackToken = token;
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* Storage unavailable. */ }
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearToken() {
  if (typeof window === "undefined") return;
  fallbackToken = null;
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* Storage unavailable. */ }
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function isAuthed() {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch { return false; }
}

export function subscribeAuth(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(AUTH_EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(AUTH_EVENT, listener);
  };
}
