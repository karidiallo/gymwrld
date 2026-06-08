import { useRef, useState } from "react";
import { X, Lock } from "lucide-react";
import { type AvatarConfig } from "./AvatarSvg";
import { AvatarModel } from "./AvatarModel";
import sanctuary from "@/assets/sanctuary.jpg";

const ROOMS = [
  { id: "starter", name: "Apartament startowy", bgImg: sanctuary, bg: "linear-gradient(180deg,#1a1428 0%,#0f0a1a 70%,#000 100%)", floor: "#2a1f3d", locked: false },
  { id: "loft", name: "Loft Premium", bg: "linear-gradient(180deg,#0e1d2a 0%,#0a1320 70%,#000 100%)", floor: "#1d2f44", locked: true, req: "Lvl 20" },
  { id: "penthouse", name: "Penthouse", bg: "linear-gradient(180deg,#2a0e1d 0%,#1a0814 70%,#000 100%)", floor: "#3d1828", locked: true, req: "Lvl 40" },
  { id: "skyhouse", name: "Sky House", bg: "linear-gradient(180deg,#0e2a23 0%,#0a1a18 70%,#000 100%)", floor: "#1d3d33", locked: true, req: "Lvl 60" },
];

export function AvatarViewer({ cfg, onClose }: { cfg: AvatarConfig; onClose: () => void }) {
  const [rot, setRot] = useState(0);
  const [room, setRoom] = useState(ROOMS[0]);
  const dragging = useRef<{ x: number; r: number } | null>(null);

  const startDrag = (x: number) => (dragging.current = { x, r: rot });
  const move = (x: number) => {
    if (!dragging.current) return;
    const dx = x - dragging.current.x;
    setRot((360 + dragging.current.r + dx * 1.5) % 360);
  };
  const end = () => (dragging.current = null);

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
      <div
        className="absolute inset-x-0 top-24 bottom-44 grid place-items-end touch-none select-none"
        onMouseDown={(e) => startDrag(e.clientX)}
        onMouseMove={(e) => move(e.clientX)}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={(e) => startDrag(e.touches[0].clientX)}
        onTouchMove={(e) => move(e.touches[0].clientX)}
        onTouchEnd={end}
      >
        <div
          className="h-[86%]"
          style={{
            filter: `drop-shadow(0 30px 40px rgba(0,0,0,0.6)) drop-shadow(0 0 30px ${cfg.outfitTint}55)`,
            transform: `translateX(${Math.sin((rot * Math.PI) / 180) * 18}px)`,
            transition: "transform 80ms linear",
          }}
        >
          <AvatarModel cfg={cfg} height="100%" rotation={rot} />
        </div>
      </div>

      {/* rotation slider */}
      <div className="absolute inset-x-6 bottom-32 z-10">
        <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-muted-foreground">Przeciągnij lub obróć · {Math.round(rot)}°</p>
        <input
          type="range" min={0} max={360} value={rot}
          onChange={(e) => setRot(parseInt(e.target.value))}
          className="w-full accent-[var(--orange)]"
        />
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