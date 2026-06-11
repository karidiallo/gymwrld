import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type ProfileRow = {
  id: string;
  email?: string | null;
  name?: string | null;
  nickname?: string | null;
  city?: string | null;
  gender?: string | null;
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  goals?: string[] | null;
  level?: string | null;
  freq?: number | null;
  subscription?: string | null;
  lvl?: number | null;
  xp?: number | null;
};

function localOnboarded() {
  return typeof window !== "undefined" && localStorage.getItem("gw_onboarded") === "1";
}

export function isProfileComplete(profile?: ProfileRow | null) {
  return !!(profile?.city && profile?.gender && profile?.level && profile?.goals?.length);
}

export function syncProfileToLocal(profile: ProfileRow) {
  if (typeof window === "undefined") return;
  const current = JSON.parse(localStorage.getItem("gw_profile") ?? "{}");
  const next = {
    ...current,
    name: profile.name ?? current.name,
    nickname: profile.nickname ?? current.nickname,
    email: profile.email ?? current.email,
    city: profile.city ?? current.city,
    gender: profile.gender ?? current.gender,
    age: profile.age ?? current.age,
    weight: profile.weight ?? current.weight,
    height: profile.height ?? current.height,
    goals: profile.goals ?? current.goals,
    level: profile.level ?? current.level,
    freq: profile.freq ?? current.freq,
    subscription: profile.subscription ?? current.subscription ?? "free",
    lvl: profile.lvl ?? current.lvl ?? 1,
    xp: profile.xp ?? current.xp ?? 0,
    stats: current.stats ?? { sila: 0, kondycja: 0, dieta: 0, sen: 0, rozwoj: 0 },
  };
  localStorage.setItem("gw_profile", JSON.stringify(next));
  if (isProfileComplete(profile)) localStorage.setItem("gw_onboarded", "1");
  window.dispatchEvent(new Event("gw_profile_update"));
}

export async function ensureCloudProfile(user: User) {
  const name = user.user_metadata?.name ?? user.user_metadata?.full_name ?? null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (data) {
    syncProfileToLocal(data);
    return data as ProfileRow;
  }
  // First-time profile creation. If user landed via a referral link we stored
  // the code in localStorage; resolve it to the referrer's user id now.
  let referred_by: string | null = null;
  try {
    const ref = typeof window !== "undefined" ? localStorage.getItem("gw_ref") : null;
    if (ref) {
      const { data: r } = await supabase.from("profiles").select("id").eq("referral_code", ref).maybeSingle();
      if (r?.id && r.id !== user.id) referred_by = r.id;
      localStorage.removeItem("gw_ref");
    }
  } catch {}
  const fallback: any = { id: user.id, email: user.email ?? null, name };
  if (referred_by) fallback.referred_by = referred_by;
  await supabase.from("profiles").upsert(fallback);
  syncProfileToLocal(fallback);
  return fallback as ProfileRow;
}

export async function getPostAuthDestination(user: User) {
  const profile = await ensureCloudProfile(user);
  return localOnboarded() || isProfileComplete(profile) ? "/" : "/onboarding";
}