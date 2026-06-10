import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Apple, Dumbbell, Moon, MoreHorizontal, Tag, User, X } from "lucide-react";
import { useState } from "react";

const primary = [
  { to: "/", label: "Główna", icon: Home },
  { to: "/dieta", label: "Dieta", icon: Apple },
  { to: "/trening", label: "Trening", icon: Dumbbell },
  { to: "/regeneracja", label: "Reset", icon: Moon },
] as const;

const more = [
  { to: "/profil", label: "Profil", icon: User },
  { to: "/promo", label: "Promo", icon: Tag },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [openMore, setOpenMore] = useState(false);
  if (
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/privacy")
  ) return null;
  const moreActive = more.some((m) => pathname.startsWith(m.to));
  return (
    <>
      {openMore && (
        <div onClick={() => setOpenMore(false)} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
      )}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-4 pt-2 pointer-events-none">
        <div className="pointer-events-auto relative flex w-[96%] max-w-[520px] items-center justify-between rounded-full px-3 py-3 shadow-[0_20px_60px_-10px_rgba(233,69,96,0.5)] ring-1 ring-white/12 backdrop-blur-2xl"
          style={{ background: "linear-gradient(135deg, rgba(233,69,96,0.32), rgba(255,140,60,0.24) 50%, rgba(167,139,250,0.30))" }}>
          {primary.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              onClick={() => setOpenMore(false)}
              className="group relative flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-2.5 text-[12px] font-semibold text-white/80 transition-colors"
              activeProps={{ className: "text-foreground" }}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-[var(--magenta)] via-[var(--orange)] to-[var(--violet)] opacity-95 ring-1 ring-white/25 shadow-lg" />
                  )}
                  <Icon className={`h-[24px] w-[24px] transition-transform ${isActive ? "scale-110 text-white" : "group-hover:scale-105"}`} strokeWidth={2.2} />
                  <span>{label}</span>
                </>
              )}
            </Link>
          ))}
          <button
            onClick={() => setOpenMore((v) => !v)}
            className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-2.5 text-[12px] font-semibold transition-colors ${moreActive || openMore ? "text-foreground" : "text-white/80"}`}
          >
            {(moreActive || openMore) && (
              <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-[var(--magenta)] via-[var(--orange)] to-[var(--violet)] opacity-95 ring-1 ring-white/25 shadow-lg" />
            )}
            {openMore ? <X className="h-[24px] w-[24px]" strokeWidth={2.2} /> : <MoreHorizontal className="h-[24px] w-[24px]" strokeWidth={2.2} />}
            <span>Więcej</span>
          </button>

          {openMore && (
            <div className="absolute bottom-[calc(100%+10px)] right-2 w-44 rounded-2xl bg-black/85 p-1.5 ring-1 ring-white/15 backdrop-blur-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.7)]">
              {more.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpenMore(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10"
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}