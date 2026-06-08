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
  if (pathname.startsWith("/onboarding")) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-4 pt-2 pointer-events-none">
      <div className="glass pointer-events-auto flex w-[92%] max-w-[460px] items-center justify-between rounded-full px-2 py-2 shadow-2xl">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="group relative flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-2 text-[10px] font-medium text-muted-foreground transition-colors"
            activeProps={{ className: "text-foreground" }}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-[var(--magenta)]/30 via-[var(--orange)]/20 to-[var(--violet)]/20 ring-1 ring-white/15" />
                )}
                <Icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110 text-white" : "group-hover:scale-105"}`} strokeWidth={2.2} />
                <span>{label}</span>
              </>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}