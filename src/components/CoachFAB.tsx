import { Link, useRouterState } from "@tanstack/react-router";
import { MessageCircleHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const HIDDEN = ["/welcome", "/privacy", "/auth", "/onboarding", "/coach"];

export function CoachFAB() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!authed) return null;
  if (HIDDEN.some((p) => pathname.startsWith(p))) return null;

  return (
    <Link
      to="/coach"
      aria-label="AI Coach"
      className="fixed bottom-24 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] text-background shadow-[0_10px_40px_-10px_rgba(255,80,120,0.65)] ring-1 ring-white/15 transition active:scale-95"
    >
      <MessageCircleHeart className="h-6 w-6" />
      <span className="absolute -top-1 -right-1 rounded-full bg-foreground px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-background">
        AI
      </span>
    </Link>
  );
}