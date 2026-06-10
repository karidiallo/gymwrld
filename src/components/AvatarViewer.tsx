import { useEffect, useState } from "react";
import { X, Lock, Check } from "lucide-react";
import { type AvatarConfig } from "./AvatarSvg";
import sanctuary from "@/assets/sanctuary.jpg";
import roomLoft from "@/assets/room-loft.jpg";
import roomParis from "@/assets/room-paris.jpg";
import roomMilano from "@/assets/room-milano.jpg";
import roomBarcelona from "@/assets/room-barcelona.jpg";
import roomVilla from "@/assets/room-villa.jpg";

const ROOMS = [
  { id: "starter", name: "Apartament startowy", bgImg: sanctuary, bg: "linear-gradient(180deg,#1a1428 0%,#0f0a1a 70%,#000 100%)", locked: false },
  { id: "loft", name: "Loft · Berlin", bgImg: roomLoft, bg: "linear-gradient(180deg,#0e1d2a 0%,#0a1320 70%,#000 100%)", locked: true, req: "Lvl 5" },
  { id: "paris", name: "Atelier · Paryż", bgImg: roomParis, bg: "linear-gradient(180deg,#1a1428 0%,#100a18 70%,#000 100%)", locked: true, req: "Lvl 10" },
  { id: "penthouse", name: "Penthouse · Mediolan", bgImg: roomMilano, bg: "linear-gradient(180deg,#2a0e1d 0%,#1a0814 70%,#000 100%)", locked: true, req: "Lvl 20 · Premium" },
  { id: "skyhouse", name: "Sky House · Barcelona", bgImg: roomBarcelona, bg: "linear-gradient(180deg,#0e2a23 0%,#0a1a18 70%,#000 100%)", locked: true, req: "Lvl 30 · Premium" },
  { id: "villa", name: "Vila · Lazurowe", bgImg: roomVilla, bg: "linear-gradient(180deg,#2a1a0e 0%,#1a1108 70%,#000 100%)", locked: true, req: "Lvl 40 · Premium" },
];

const KEY = "gw_active_room";

export function AvatarViewer({ cfg: _cfg, onClose }: { cfg: AvatarConfig; onClose: () => void }) {
  const [activeId, setActiveId] = useState<string>(() => {
    if (typeof window === "undefined") return "starter";
    return localStorage.getItem(KEY) ?? "starter";
  });
  const room = ROOMS.find((r) => r.id === activeId) ?? ROOMS[0];

  const choose = (id: string) => {
    setActiveId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, id);
      window.dispatchEvent(new Event("gw_room_change"));
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] bg-background">
      {room.bgImg ? (
        <img src={room.bgImg} alt={room.name} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={{ background: room.bg }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/80" />

      <button onClick={onClose} aria-label="Zamknij" className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full glass">
        <X className="h-4 w-4" />
      </button>
      <div className="absolute left-4 top-4 z-10 rounded-full glass px-3 py-1.5 text-[11px]">
        <span className="text-muted-foreground">Pokój:</span> <span className="font-medium">{room.name}</span>
      </div>

      <div className="absolute inset-x-0 top-24 z-10 px-5">
        <h2 className="text-2xl font-semibold tracking-tight">Wybierz pokój</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tło Twojego sanktuarium na ekranie głównym.</p>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 max-h-[65%] overflow-y-auto px-4 pb-6 pt-4">
        <div className="grid grid-cols-2 gap-3">
          {ROOMS.map((r) => {
            const active = room.id === r.id;
            return (
              <button
                key={r.id}
                onClick={() => !r.locked && choose(r.id)}
                disabled={r.locked}
                className={`group relative overflow-hidden rounded-2xl text-left transition ${
                  active ? "ring-2 ring-[var(--lime)]" : "ring-1 ring-white/10"
                } ${r.locked ? "opacity-70" : "hover:ring-white/30"}`}
              >
                <div className="aspect-[4/3] w-full">
                  {r.bgImg ? (
                    <img src={r.bgImg} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full" style={{ background: r.bg }} />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium leading-tight">{r.name}</span>
                    {active ? (
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--lime)] text-black">
                        <Check className="h-3 w-3" />
                      </span>
                    ) : r.locked ? (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : null}
                  </div>
                  {r.locked && <p className="mt-0.5 text-[10px] text-muted-foreground">{r.req}</p>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}