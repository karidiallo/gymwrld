import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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
}

export async function clearAuthSession() {
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Local storage cleanup below is the source of truth for broken/stale sessions.
  }
  clearStoredAuthSession();
}

export async function getCurrentUserOrClear(): Promise<User | null> {
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