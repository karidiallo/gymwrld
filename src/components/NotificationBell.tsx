import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { unreadCount } from "@/lib/notifications";

export function NotificationBell({ className = "" }: { className?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const up = () => setN(unreadCount());
    up();
    window.addEventListener("gw_notifs_update", up);
    return () => window.removeEventListener("gw_notifs_update", up);
  }, []);
  return (
    <Link to="/notifications" className={`relative grid h-10 w-10 place-items-center rounded-full glass ${className}`} aria-label="Powiadomienia">
      <Bell className="h-4 w-4" />
      {n > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-r from-[var(--magenta)] to-[var(--orange)] px-1 text-[10px] font-bold text-background">
          {n > 9 ? "9+" : n}
        </span>
      )}
    </Link>
  );
}