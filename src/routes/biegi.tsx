import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, MapPin, Flame, Plus, Trophy, X, Calendar, Activity, Mountain, Watch, Play, Square } from "lucide-react";
import { addLog, removeLog, updateLog } from "@/lib/training-log";
import { EntryActions } from "@/components/EntryActions";
import { PL_CITIES } from "@/routes/onboarding";

export const Route = createFileRoute("/biegi")({
  head: () => ({ meta: [{ title: "Maraton — GymWrld" }, { name: "description", content: "Loguj swoje biegi, trasy i nadchodzące zawody." }] }),
  component: Biegi,
});

type Run = { id: string; km: number; min: number; pace: string; kcal: number; date: string; route: string };

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

const UPCOMING = [
  { id: "wmm", title: "Warsaw Marathon", date: "28 września 2026", city: "Warszawa", dist: "42.2 km", color: "from-[#5a0f0f] to-[#1a0202]" },
  { id: "krk", title: "Cracovia Half", date: "12 października 2026", city: "Kraków", dist: "21.1 km", color: "from-[#3b0a0a] to-[#0c0202]" },
  { id: "wro", title: "Wroclaw Night Run", date: "5 listopada 2026", city: "Wrocław", dist: "10 km", color: "from-[#1a0a3b] to-[#03020c]" },
];

function Biegi() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [open, setOpen] = useState(false);
  const [km, setKm] = useState<number | "">("");
  const [min, setMin] = useState<number | "">("");
  const [route, setRoute] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cityId, setCityId] = useState<string>("warszawa");
  const [healthConnected, setHealthConnected] = useState(false);

  // Live GPS tracking
  const [tracking, setTracking] = useState(false);
  const [trackKm, setTrackKm] = useState(0);
  const [trackSec, setTrackSec] = useState(0);
  const [trackPath, setTrackPath] = useState<{ lat: number; lon: number }[]>([]);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [tickId, setTickId] = useState<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
    if (tickId) clearInterval(tickId);
  }, [watchId, tickId]);

  const startTracking = () => {
    if (!navigator.geolocation) { toast.error("Brak GPS w tym urządzeniu"); return; }
    // First, explicitly request permission so the toast reflects user's choice
    toast.loading("Czekam na zgodę GPS…", { id: "gps-perm" });
    navigator.geolocation.getCurrentPosition(
      () => {
        toast.dismiss("gps-perm");
        // permission granted — start the actual watcher
        setTrackKm(0); setTrackSec(0); setTrackPath([]);
        setTracking(true);
        const t0 = Date.now();
        const ti = setInterval(() => setTrackSec(Math.floor((Date.now() - t0) / 1000)), 1000);
        setTickId(ti);
        const id = navigator.geolocation.watchPosition(
          (pos) => {
        const p = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setTrackPath((prev) => {
          const next = [...prev, p];
          if (prev.length > 0 && pos.coords.accuracy < 30) {
            const d = haversineKm(prev[prev.length - 1], p);
            if (d < 0.2) setTrackKm((k) => k + d);
          }
          return next;
        });
          },
          (err) => toast.error("GPS: " + err.message),
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 },
        );
        setWatchId(id);
        localStorage.setItem("gw_health_connected", "1");
        setHealthConnected(true);
        toast.success("Nagrywanie biegu rozpoczęte");
      },
      (err) => {
        toast.dismiss("gps-perm");
        if (err.code === err.PERMISSION_DENIED) toast.error("Brak zgody na GPS — włącz lokalizację w przeglądarce");
        else toast.error("GPS: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const stopTracking = () => {
    if (watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
    if (tickId) clearInterval(tickId);
    setWatchId(null); setTickId(null); setTracking(false);
    const kmN = Math.round(trackKm * 100) / 100;
    const minN = Math.max(1, Math.round(trackSec / 60));
    if (kmN < 0.05) { toast("Za krótki dystans — nie zapisano"); return; }
    const paceMin = minN / kmN;
    const m = Math.floor(paceMin);
    const s = Math.round((paceMin - m) * 60);
    const kcal = Math.round(kmN * 65);
    const title = "Bieg GPS";
    const polyline = JSON.stringify(trackPath);
    const log = addLog({ kind: "bieg", title: `Bieg ${kmN} km`, kcal, minutes: minN, meta: { route: title, polyline } });
    persist([{ id: log.id, km: kmN, min: minN, pace: `${m}:${String(s).padStart(2,"0")} /km`, kcal, date: new Date(log.ts).toLocaleDateString("pl"), route: title }, ...runs]);
    toast.success(`Zapisano bieg ${kmN} km`);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { const raw = localStorage.getItem("gw_runs"); if (raw) setRuns(JSON.parse(raw)); } catch {}
    try {
      const rp = localStorage.getItem("gw_profile");
      if (rp) { const p = JSON.parse(rp); if (p.city) setCityId(p.city); }
      setHealthConnected(localStorage.getItem("gw_health_connected") === "1");
    } catch {}
  }, []);

  const city = PL_CITIES.find((c) => c.id === cityId) ?? PL_CITIES[0];
  const d = 0.04;
  const bbox = `${city.lon - d},${city.lat - d / 2},${city.lon + d},${city.lat + d / 2}`;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${city.lat},${city.lon}`;

  const connectHealth = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Twoje urządzenie nie wspiera GPS"); return;
    }
    toast.loading("Czekam na zgodę GPS…", { id: "gps-perm" });
    navigator.geolocation.getCurrentPosition(
      () => {
        toast.dismiss("gps-perm");
        localStorage.setItem("gw_health_connected", "1");
        setHealthConnected(true);
        toast.success("GPS połączony — możesz nagrywać biegi");
      },
      (err) => {
        toast.dismiss("gps-perm");
        localStorage.removeItem("gw_health_connected");
        setHealthConnected(false);
        if (err.code === err.PERMISSION_DENIED) toast.error("Odmówiono dostępu do lokalizacji");
        else toast.error("Brak GPS: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };
  const persist = (next: Run[]) => {
    setRuns(next);
    if (typeof window !== "undefined") localStorage.setItem("gw_runs", JSON.stringify(next));
  };

  const save = () => {
    if (!km || !min) { toast.error("Podaj dystans i czas"); return; }
    const kmN = Number(km), minN = Number(min);
    const paceMin = minN / kmN;
    const m = Math.floor(paceMin);
    const s = Math.round((paceMin - m) * 60);
    const kcal = Math.round(kmN * 65);
    const title = route || "Trasa bez nazwy";
    if (editingId) {
      persist(runs.map((r) => r.id === editingId ? { ...r, km: kmN, min: minN, pace: `${m}:${String(s).padStart(2,"0")} /km`, kcal, route: title } : r));
      updateLog(editingId, { kcal, minutes: minN, title: `Bieg ${kmN} km`, meta: { route: title } });
      toast.success("Bieg zaktualizowany");
    } else {
      const log = addLog({ kind: "bieg", title: `Bieg ${kmN} km`, kcal, minutes: minN, meta: { route: title } });
      const r: Run = {
        id: log.id, km: kmN, min: minN,
        pace: `${m}:${String(s).padStart(2, "0")} /km`,
        kcal, date: new Date(log.ts).toLocaleDateString("pl"), route: title,
      };
      persist([r, ...runs]);
      toast.success(`Bieg ${kmN} km zapisany`);
    }
    setKm(""); setMin(""); setRoute("");
    setEditingId(null);
    setOpen(false);
  };

  const startEdit = (r: Run) => {
    setKm(r.km); setMin(r.min); setRoute(r.route);
    setEditingId(r.id);
    setOpen(true);
  };
  const remove = (id: string) => {
    persist(runs.filter((r) => r.id !== id));
    removeLog(id);
    toast.success("Bieg usunięty");
  };

  const total = runs.reduce((s, r) => s + r.km, 0);

  return (
    <main className="px-5 pt-6 pb-32">
      <header className="flex items-center justify-between">
        <Link to="/trening" className="grid h-9 w-9 place-items-center rounded-full glass">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Maraton</span>
        <div className="h-9 w-9" />
      </header>

      {/* Hero */}
      <section className="relative mt-5 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#3b0a0a] via-[#1a0505] to-black p-5">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[var(--orange)]/20 blur-3xl" />
        <p className="text-[10px] uppercase tracking-[0.28em] text-white/70">Twój dziennik biegacza</p>
        <h1 className="mt-1 font-display text-3xl text-white">Biegnij <span className="text-[var(--orange)]">dalej</span></h1>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Łącznie" value={`${total.toFixed(1)} km`} />
          <Stat label="Biegi" value={`${runs.length}`} />
          <Stat label="Streak" value="0 dni" />
        </div>
        <button onClick={() => setOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black">
          <Plus className="h-4 w-4" /> Dodaj bieg
        </button>
      </section>

      {/* Health / GPS connect */}
      <div className={`mt-5 flex items-center gap-3 rounded-2xl p-3.5 ${healthConnected ? "bg-[var(--lime)]/10 ring-1 ring-[var(--lime)]/30" : "glass"}`}>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5"><Watch className="h-4 w-4" /></div>
        <div className="flex-1">
          <p className="text-sm font-medium">{healthConnected ? "GPS połączony" : "Włącz GPS"}</p>
          <p className="text-[11px] text-muted-foreground">{healthConnected ? "Możesz zapisywać trasy z lokalizacji" : "System poprosi o udostępnienie położenia"}</p>
        </div>
        {!healthConnected && (
          <button onClick={connectHealth} className="rounded-full bg-white text-black px-3 py-1.5 text-[11px] font-semibold">Połącz</button>
        )}
      </div>

      {/* Live GPS recorder */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0e1a14] to-black p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--lime)]">Live GPS</p>
            <p className="mt-0.5 text-sm font-medium">{tracking ? "Nagrywam bieg…" : "Nagraj bieg z GPS"}</p>
          </div>
          {!tracking ? (
            <button onClick={startTracking} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--lime)] px-3 py-1.5 text-[11px] font-semibold text-background">
              <Play className="h-3 w-3" /> Start
            </button>
          ) : (
            <button onClick={stopTracking} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--magenta)] px-3 py-1.5 text-[11px] font-semibold text-white">
              <Square className="h-3 w-3" /> Stop
            </button>
          )}
        </div>
        {tracking && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Stat label="Dystans" value={`${trackKm.toFixed(2)} km`} />
            <Stat label="Czas" value={`${Math.floor(trackSec/60)}:${String(trackSec%60).padStart(2,"0")}`} />
            <Stat label="Pace" value={trackKm > 0.05 ? (() => { const p = (trackSec/60)/trackKm; const m = Math.floor(p); const s = Math.round((p-m)*60); return `${m}:${String(s).padStart(2,"0")}`; })() : "—"} />
          </div>
        )}
      </div>

      {/* Map */}
      <div className="mb-3 mt-7 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Mapa · {city.name}</h3>
        <select value={cityId} onChange={(e) => setCityId(e.target.value)} className="rounded-full bg-white/5 px-3 py-1 text-[11px] outline-none">
          {PL_CITIES.map((c) => <option key={c.id} value={c.id} className="bg-background">{c.name}</option>)}
        </select>
      </div>
      <div className="relative overflow-hidden rounded-3xl border border-white/10">
        <iframe
          key={cityId}
          title={`Mapa ${city.name}`}
          src={mapSrc}
          className="h-72 w-full"
          style={{ filter: "invert(0.92) hue-rotate(180deg) saturate(0.85)" }}
          loading="lazy"
        />
      </div>

      {/* List */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Historia biegów</h3>
      {runs.length === 0 ? (
        <div className="rounded-2xl glass p-5 text-center text-xs text-muted-foreground">
          Brak biegów · dodaj pierwszy
        </div>
      ) : (
        <div className="space-y-2.5">
          {runs.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-2xl glass p-3.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--orange)]/15 text-[var(--orange)]"><Activity className="h-4 w-4" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{r.route}</p>
                <p className="text-[11px] text-muted-foreground">{r.km} km · {r.min} min · {r.pace} · {r.kcal} kcal</p>
              </div>
              <p className="text-[10px] text-muted-foreground">{r.date}</p>
              <EntryActions onEdit={() => startEdit(r)} onDelete={() => remove(r.id)} />
            </div>
          ))}
        </div>
      )}

      {/* Upcoming races */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Nadchodzące zawody</h3>
      <div className="space-y-3">
        {UPCOMING.map((u) => (
          <button key={u.id} onClick={() => toast.success(`Zapisano zainteresowanie · ${u.title}`)} className={`relative w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${u.color} p-5 text-left transition active:scale-[0.99]`}>
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/70">
              <Trophy className="h-3 w-3" /> Reklama · partner
            </div>
            <p className="mt-1 font-display text-2xl text-white">{u.title}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/80">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1"><Calendar className="h-3 w-3" /> {u.date}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1"><MapPin className="h-3 w-3" /> {u.city}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1"><Mountain className="h-3 w-3" /> {u.dist}</span>
            </div>
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-28">
            <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Bieg</p>
                <h3 className="font-display text-2xl">Dodaj sesję</h3>
              </div>
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full bg-white/5"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <NumField label="Dystans (km)" value={km} onChange={setKm} step="0.1" placeholder="5.0" />
              <NumField label="Czas (min)" value={min} onChange={setMin} placeholder="28" />
            </div>
            <label className="mt-3 block rounded-2xl bg-white/[0.04] p-3">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Trasa</span>
              <input value={route} onChange={(e) => setRoute(e.target.value)} placeholder="Park Łazienkowski" className="mt-1 w-full bg-transparent font-display text-lg outline-none placeholder:text-muted-foreground/40" />
            </label>
            <button onClick={save} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#7a1a1a] via-[var(--orange)] to-[var(--lime)] py-3.5 text-sm font-semibold text-background glow-primary">
              <Flame className="mr-1 inline h-4 w-4" /> Zapisz bieg
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/40 p-3">
      <p className="text-[10px] uppercase tracking-widest text-white/60">{label}</p>
      <p className="mt-0.5 font-display text-lg text-white">{value}</p>
    </div>
  );
}

function NumField({ label, value, onChange, placeholder, step }: { label: string; value: number | ""; onChange: (v: number | "") => void; placeholder?: string; step?: string }) {
  return (
    <label className="block rounded-2xl bg-white/[0.04] p-3">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        step={step ?? "1"}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
        className="mt-1 w-full bg-transparent font-display text-xl outline-none placeholder:text-muted-foreground/40"
      />
    </label>
  );
}