import { useState } from "react";
import { X, Lock } from "lucide-react";
import { type AvatarConfig } from "./AvatarSvg";
import { AvatarModel } from "./AvatarModel";
import sanctuary from "@/assets/sanctuary.jpg";

const ROOMS = [
  { id: "starter", name: "Apartament startowy", bgImg: sanctuary, bg: "linear-gradient(180deg,#1a1428 0%,#0f0a1a 70%,#000 100%)", floor: "#2a1f3d", locked: false },
  { id: "loft", name: "Loft · Berlin", bg: "linear-gradient(180deg,#0e1d2a 0%,#0a1320 70%,#000 100%)", floor: "#1d2f44", locked: true, req: "Lvl 5" },
  { id: "paris", name: "Atelier · Paryż", bg: "linear-gradient(180deg,#1a1428 0%,#100a18 70%,#000 100%)", floor: "#2a1f3d", locked: true, req: "Lvl 10" },
  { id: "penthouse", name: "Penthouse · Mediolan", bg: "linear-gradient(180deg,#2a0e1d 0%,#1a0814 70%,#000 100%)", floor: "#3d1828", locked: true, req: "Lvl 20 · Premium" },
  { id: "skyhouse", name: "Sky House · Barcelona", bg: "linear-gradient(180deg,#0e2a23 0%,#0a1a18 70%,#000 100%)", floor: "#1d3d33", locked: true, req: "Lvl 30 · Premium" },
  { id: "villa", name: "Vila · Lazurowe", bg: "linear-gradient(180deg,#2a1a0e 0%,#1a1108 70%,#000 100%)", floor: "#3d2818", locked: true, req: "Lvl 40 · Premium" },
];

export function AvatarViewer({ cfg, onClose }: { cfg: AvatarConfig; onClose: () => void }) {
  const [room, setRoom] = useState(ROOMS[0]);

  return (
    <div className="fixed inset-0 z-[60] bg-background">
      {/* Room background — image when available, else gradient */}
      {room.bgImg ? (
        <img src={room.bgImg} alt={room.name} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={{ background: room.bg }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-[var(--magenta)]/10 blur-3xl" />

      {/* close */}
      <button onClick={onClose} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full glass">
        <X className="h-4 w-4" />
      </button>
      <div className="absolute left-4 top-4 z-10 rounded-full glass px-3 py-1.5 text-[11px]">
        <span className="text-muted-foreground">Pokój:</span> <span className="font-medium">{room.name}</span>
      </div>

      {/* avatar stage */}
      <div className="absolute inset-x-0 top-28 bottom-48 grid place-items-end justify-center">
        <div
          className="h-[72%]"
          style={{ filter: `drop-shadow(0 30px 40px rgba(0,0,0,0.6)) drop-shadow(0 0 30px ${cfg.outfitTint}55)` }}
        >
          <AvatarModel cfg={cfg} height="100%" rotation={0} />
        </div>
      </div>

      {/* rooms picker */}
      <div className="absolute inset-x-0 bottom-4 z-10 px-4">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Pomieszczenia</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ROOMS.map((r) => {
            const active = room.id === r.id;
            return (
              <button
                key={r.id}
                onClick={() => !r.locked && setRoom(r)}
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-xs transition ${
                  active ? "ring-1 ring-[var(--lime)] bg-white/[0.06]" : "bg-white/[0.04]"
                } ${r.locked ? "opacity-60" : ""}`}
              >
                <span className="h-6 w-6 rounded-lg" style={{ background: r.bg }} />
                <span className="font-medium">{r.name}</span>
                {r.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                {r.locked && <span className="text-[10px] text-muted-foreground">{r.req}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}