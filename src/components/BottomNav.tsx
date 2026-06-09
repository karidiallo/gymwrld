import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Apple, Dumbbell, Moon, Tag, User } from "lucide-react";

const items = [
  { to: "/", label: "Główna", icon: Home },
  { to: "/dieta", label: "Dieta", icon: Apple },
  { to: "/trening", label: "Trening", icon: Dumbbell },
  { to: "/regeneracja", label: "Reset", icon: Moon },
  { to: "/promo", label: "Promo", icon: Tag },
  { to: "/profil", label: "Profil", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/privacy")
  ) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-4 pt-2 pointer-events-none">
      <div className="pointer-events-auto flex w-[94%] max-w-[480px] items-center justify-between rounded-full px-2.5 py-2.5 shadow-[0_20px_60px_-10px_rgba(233,69,96,0.45)] ring-1 ring-white/10 backdrop-blur-xl"
        style={{ background: "linear-gradient(135deg, rgba(233,69,96,0.22), rgba(255,140,60,0.18) 50%, rgba(167,139,250,0.22))" }}>
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="group relative flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-2.5 text-[11px] font-medium text-white/70 transition-colors"
            activeProps={{ className: "text-foreground" }}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-[var(--magenta)] via-[var(--orange)] to-[var(--violet)] opacity-90 ring-1 ring-white/25 shadow-lg" />
                )}
                <Icon className={`h-[22px] w-[22px] transition-transform ${isActive ? "scale-110 text-white" : "group-hover:scale-105"}`} strokeWidth={2.2} />
                <span>{label}</span>
              </>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}