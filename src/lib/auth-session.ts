import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const LIVE_SESSION_KEY = "gw_live_session";
const AUTH_INTENT_KEY = "gw_auth_intent";

export type AuthIntent = "signin" | "signup";

function isInvalidStoredSession(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (/auth session missing|session_missing|missing session|no session/i.test(message)) return false;
  if (error && typeof error === "object" && "status" in error) {
    const status = Number((error as { status?: number }).status);
    if (status === 401 || status === 403) return true;
  }
  return /user_not_found|user from sub claim|jwt|token|invalid|expired/i.test(message);
}

export function clearStoredAuthSession() {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith("sb-") && key.includes("auth-token")) keys.push(key);
  }
  keys.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem("gw_session_persist");
  sessionStorage.removeItem(LIVE_SESSION_KEY);
}

export async function clearAuthSession() {
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Local storage cleanup below is the source of truth for broken/stale sessions.
  }
  clearStoredAuthSession();
}

export function markLiveAuthSession() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LIVE_SESSION_KEY, "1");
  localStorage.removeItem("gw_session_persist");
}

export function hasLiveAuthSession() {
  return typeof window !== "undefined" && sessionStorage.getItem(LIVE_SESSION_KEY) === "1";
}

export function rememberAuthIntent(intent: AuthIntent) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(AUTH_INTENT_KEY, intent);
}

export function readAuthIntent(fallback: AuthIntent = "signin") {
  if (typeof window === "undefined") return fallback;
  const stored = sessionStorage.getItem(AUTH_INTENT_KEY);
  return stored === "signup" || stored === "signin" ? stored : fallback;
}

export function clearAuthIntent() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(AUTH_INTENT_KEY);
}

export function hasAuthCallbackInUrl() {
  if (typeof window === "undefined") return false;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const search = new URLSearchParams(window.location.search);
  return search.get("oauth") === "1" || hash.has("access_token") || hash.has("refresh_token") || hash.has("error");
}

export async function clearAuthIfNewBrowserSession() {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(LIVE_SESSION_KEY) === "1") return;
  await clearAuthSession();
}

export async function getCurrentUserOrClear(options: { requireLiveSession?: boolean } = {}): Promise<User | null> {
  if (options.requireLiveSession && !hasLiveAuthSession() && !hasAuthCallbackInUrl()) {
    await clearAuthSession();
    return null;
  }
  const result = await Promise.race([
    supabase.auth.getUser(),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
  ]);
  if (!result) return null;
  const { data, error } = result;
  if (error) {
    if (isInvalidStoredSession(error)) await clearAuthSession();
    return null;
  }
  return data.user ?? null;
}