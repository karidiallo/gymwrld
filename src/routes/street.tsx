import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, MapPin, Plus, X, Activity, Dumbbell, Info } from "lucide-react";
import { addLog, removeLog, updateLog } from "@/lib/training-log";
import { EntryActions } from "@/components/EntryActions";
import { PL_CITIES } from "@/routes/onboarding";

export const Route = createFileRoute("/street")({
  head: () => ({ meta: [{ title: "Street Workout — GymWrld" }, { name: "description", content: "Mapa lokalnych outdoor siłek, baza ćwiczeń kalistenicznych i logowanie treningów." }] }),
  component: Street,
});

type Log = { id: string; name: string; sets: number; reps: number; ts: number };

// Realne parki street workout w polskich miastach (research: flowparks, calisthenics-parks, OSiR, BO)
const SPOTS: { city: string; name: string; addr: string; lat: number; lon: number }[] = [
  // Warszawa
  { city: "warszawa", name: "Park Kalistenika Szczęśliwice", addr: "Usypiskowa 17", lat: 52.2051, lon: 20.9669 },
  { city: "warszawa", name: "Street Workout Park Bemowo", addr: "Konarskiego 1", lat: 52.2440, lon: 20.9165 },
  { city: "warszawa", name: "OSiR Praga-Płd · Stadion Podskarbińska", addr: "Siennicka / Chrzanowskiego", lat: 52.2433, lon: 21.0670 },
  { city: "warszawa", name: "Pole Mokotowskie · Workout", addr: "Pole Mokotowskie", lat: 52.2108, lon: 21.0086 },
  { city: "warszawa", name: "Park Skaryszewski · drążki", addr: "Park Skaryszewski", lat: 52.2438, lon: 21.0540 },
  // Kraków
  { city: "krakow", name: "FlowPark Park Jordana", addr: "al. 3 Maja", lat: 50.0628, lon: 19.9183 },
  { city: "krakow", name: "FlowPark Park Krowoderski (Łokietka)", addr: "Władysława Łokietka", lat: 50.0922, lon: 19.9368 },
  { city: "krakow", name: "FlowPark Park Decjusza", addr: "28 Lipca 1943", lat: 50.0658, lon: 19.8779 },
  { city: "krakow", name: "FlowPark Forteczna", addr: "Forteczna", lat: 50.0903, lon: 19.9498 },
  // Wrocław
  { city: "wroclaw", name: "Park Tołpy · workout", addr: "Park Tołpy", lat: 51.1212, lon: 17.0578 },
  { city: "wroclaw", name: "Wyspa Słodowa", addr: "Wyspa Słodowa", lat: 51.1146, lon: 17.0408 },
  // Poznań
  { city: "poznan", name: "Park Cytadela · workout", addr: "Park Cytadela", lat: 52.4221, lon: 16.9264 },
  { city: "poznan", name: "Park Sołacki", addr: "Park Sołacki", lat: 52.4287, lon: 16.9015 },
  // Gdańsk
  { city: "gdansk", name: "Park Reagana", addr: "Park Reagana, Przymorze", lat: 54.3970, lon: 18.5640 },
  { city: "gdansk", name: "Siłownia Augustowska", addr: "ul. Augustowska", lat: 54.3450, lon: 18.6401 },
  // Gdynia
  { city: "gdynia", name: "Park Centralny Gdynia", addr: "Park Centralny", lat: 54.5181, lon: 18.5321 },
  // Łódź
  { city: "lodz", name: "Park Poniatowskiego · workout", addr: "Park Poniatowskiego", lat: 51.7560, lon: 19.4304 },
  // Toruń
  { city: "torun", name: "Park Tysiąclecia · workout", addr: "Park Tysiąclecia", lat: 53.0180, lon: 18.6101 },
  // Bydgoszcz
  { city: "bydgoszcz", name: "Park Witosa · workout", addr: "Park Witosa", lat: 53.1394, lon: 17.9870 },
  // Szczecin
  { city: "szczecin", name: "Park Kasprowicza", addr: "Park Kasprowicza", lat: 53.4427, lon: 14.5412 },
  // Katowice
  { city: "katowice", name: "Dolina Trzech Stawów", addr: "Dolina Trzech Stawów", lat: 50.2472, lon: 19.0443 },
  // Lublin
  { city: "lublin", name: "Park Ludowy · workout", addr: "Park Ludowy", lat: 51.2348, lon: 22.5550 },
  // Białystok
  { city: "bialystok", name: "Park Planty · drążki", addr: "Park Planty", lat: 53.1311, lon: 23.1660 },
  // Rzeszów
  { city: "rzeszow", name: "Bulwary nad Wisłokiem", addr: "Bulwary nad Wisłokiem", lat: 50.0413, lon: 22.0050 },
];

const STREET_EXERCISES = [
  { id: "pu", emoji: "💪", name: "Pull-up (podciąganie)", how: "Chwyt nachwytem na szerokość barków. Podciągnij się aż broda będzie nad drążkiem, opuść kontrolowanie." },
  { id: "di", emoji: "🦾", name: "Dips na poręczach", how: "Zegnij łokcie do 90°, trzymaj korpus lekko pochylony, wypchnij się do pełnego wyprostu." },
  { id: "mu", emoji: "🚀", name: "Muscle-up", how: "Eksplozywne podciągnięcie z pociągnięciem przez drążek do podporu. Zaczynaj od progresji: high pull-up + transitions." },
  { id: "lv", emoji: "🪂", name: "Front lever", how: "Z wisu zwinąć biodra i wyprostować ciało równolegle do ziemi. Trening progresją: tuck → adv. tuck → straddle → full." },
  { id: "hs", emoji: "🤸", name: "Handstand", how: "Stanie na rękach przy ścianie. Ramiona w pełnym wyproście, brzuch i pośladki spięte." },
  { id: "pi", emoji: "🧗", name: "Pistol squat", how: "Przysiad na jednej nodze, druga wyprostowana. Zachowaj proste plecy i piętę na ziemi." },
];

function Street() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [sets, setSets] = useState<number | "">(3);
  const [reps, setReps] = useState<number | "">(8);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cityId, setCityId] = useState("warszawa");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("gw_street");
      if (raw) setLogs(JSON.parse(raw));
      const rp = localStorage.getItem("gw_profile");
      if (rp) { const p = JSON.parse(rp); if (p.city) setCityId(p.city); }
    } catch {}
  }, []);

  const city = PL_CITIES.find((c) => c.id === cityId) ?? PL_CITIES[0];
  const spots = SPOTS.filter((s) => s.city === cityId);
  // BBox auto-skalujący, by zmieścił wszystkie parki w mieście
  const bbox = (() => {
    if (spots.length === 0) {
      const d = 0.04;
      return { minLon: city.lon - d, maxLon: city.lon + d, minLat: city.lat - d / 2, maxLat: city.lat + d / 2 };
    }
    const lats = spots.map((s) => s.lat).concat(city.lat);
    const lons = spots.map((s) => s.lon).concat(city.lon);
    const padLat = 0.012, padLon = 0.022;
    return {
      minLon: Math.min(...lons) - padLon, maxLon: Math.max(...lons) + padLon,
      minLat: Math.min(...lats) - padLat, maxLat: Math.max(...lats) + padLat,
    };
  })();
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}&layer=mapnik`;
  const toXY = (lat: number, lon: number) => ({
    x: ((lon - bbox.minLon) / (bbox.maxLon - bbox.minLon)) * 100,
    y: ((bbox.maxLat - lat) / (bbox.maxLat - bbox.minLat)) * 100,
  });
  const distKm = (lat: number, lon: number) => {
    const R = 6371, dLat = ((lat - city.lat) * Math.PI) / 180, dLon = ((lon - city.lon) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((city.lat * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  };

  const save = () => {
    if (!name || !sets || !reps) { toast.error("Uzupełnij dane"); return; }
    const setsN = Number(sets), repsN = Number(reps);
    if (editingId) {
      const next = logs.map((l) => l.id === editingId ? { ...l, name, sets: setsN, reps: repsN } : l);
      setLogs(next);
      if (typeof window !== "undefined") localStorage.setItem("gw_street", JSON.stringify(next));
      updateLog(editingId, { title: `${name}`, meta: { sets: setsN, reps: repsN } });
      toast.success("Wpis zaktualizowany");
    } else {
      const kcal = Math.round(setsN * repsN * 0.6);
      const log = addLog({ kind: "street", title: name, kcal, minutes: Math.max(5, Math.round(setsN * 1.5)), meta: { sets: setsN, reps: repsN } });
      const next: Log[] = [{ id: log.id, name, sets: setsN, reps: repsN, ts: log.ts }, ...logs];
      setLogs(next);
      if (typeof window !== "undefined") localStorage.setItem("gw_street", JSON.stringify(next));
      toast.success("Zapisano ćwiczenie");
    }
    setName(""); setSets(3); setReps(8);
    setEditingId(null);
    setOpen(false);
  };

  const startEdit = (l: Log) => {
    setName(l.name); setSets(l.sets); setReps(l.reps);
    setEditingId(l.id);
    setOpen(true);
  };
  const remove = (id: string) => {
    const next = logs.filter((l) => l.id !== id);
    setLogs(next);
    if (typeof window !== "undefined") localStorage.setItem("gw_street", JSON.stringify(next));
    removeLog(id);
    toast.success("Wpis usunięty");
  };

  return (
    <main className="px-5 pt-6 pb-32">
      <header className="flex items-center justify-between">
        <Link to="/trening" className="grid h-9 w-9 place-items-center rounded-full glass">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Street Workout</span>
        <div className="h-9 w-9" />
      </header>

      <section className="relative mt-5 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0a3b1a] via-[#0f2a14] to-black p-5">
        <p className="text-[10px] uppercase tracking-[0.28em] text-white/70">Outdoor calisthenics</p>
        <h1 className="mt-1 font-display text-3xl text-white">Trenuj <span className="text-[var(--lime)]">na zewnątrz</span></h1>
        <p className="mt-1 text-xs text-white/70">Mapa lokalnych siłek, baza ćwiczeń i logowanie progresji.</p>
        <button onClick={() => setOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black">
          <Plus className="h-4 w-4" /> Dodaj ćwiczenie
        </button>
      </section>

      {/* Map */}
      <div className="mb-3 mt-7 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Lokalne siłki · {city.name}</h3>
        <select value={cityId} onChange={(e) => setCityId(e.target.value)} className="rounded-full bg-white/5 px-3 py-1 text-[11px] outline-none">
          {PL_CITIES.map((c) => <option key={c.id} value={c.id} className="bg-background">{c.name}</option>)}
        </select>
      </div>
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a1a14]">
        <div className="relative h-72">
          <iframe key={cityId} title={`Street workout ${city.name}`} src={mapSrc} className="h-full w-full" style={{ filter: "invert(0.92) hue-rotate(180deg) saturate(0.9)" }} loading="lazy" />
          <div className="pointer-events-none absolute inset-0">
            {spots.map((s) => {
              const { x, y } = toXY(s.lat, s.lon);
              return (
                <button
                  key={s.name}
                  onClick={() => toast.success(`${s.name} · ${s.addr}`)}
                  className="pointer-events-auto absolute -translate-x-1/2 -translate-y-full"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  title={s.name}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--lime)] text-background shadow-lg ring-2 ring-black/40">
                    <MapPin className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="space-y-1 p-3">
          {spots.length === 0 ? (
            <div className="rounded-xl bg-white/[0.03] px-3 py-3 text-center text-[11px] text-muted-foreground">
              Brak zmapowanych parków w {city.name}. Dodaj swój przez „Loguj".
            </div>
          ) : spots.map((s) => (
            <a key={s.name} href={`https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lon}#map=18/${s.lat}/${s.lon}`} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 text-xs hover:bg-white/[0.06]">
              <span className="flex items-center gap-2 truncate"><MapPin className="h-3 w-3 shrink-0 text-[var(--lime)]" /> <span className="truncate">{s.name}</span><span className="text-muted-foreground/70 truncate">· {s.addr}</span></span>
              <span className="ml-2 shrink-0 text-muted-foreground">{distKm(s.lat, s.lon)} km</span>
            </a>
          ))}
        </div>
      </div>

      {/* Exercise library */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Baza ćwiczeń</h3>
      <div className="space-y-2.5">
        {STREET_EXERCISES.map((e) => (
          <div key={e.id} className="rounded-2xl glass p-3.5">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--lime)]/15 text-xl">{e.emoji}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{e.name}</p>
                <p className="mt-0.5 flex items-start gap-1 text-[11px] text-muted-foreground">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" /> {e.how}
                </p>
              </div>
              <button onClick={() => { setName(e.name); setOpen(true); }} className="rounded-full bg-white/5 px-3 py-1 text-[10px]">Loguj</button>
            </div>
          </div>
        ))}
      </div>

      {/* Logged */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Twoje logi</h3>
      {logs.length === 0 ? (
        <div className="rounded-2xl glass p-5 text-center text-xs text-muted-foreground">Brak wpisów</div>
      ) : (
        <div className="space-y-2.5">
          {logs.map((l) => (
            <div key={l.id} className="flex items-center gap-3 rounded-2xl glass p-3.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--lime)]/15 text-[var(--lime)]"><Dumbbell className="h-4 w-4" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{l.name}</p>
                <p className="text-[11px] text-muted-foreground">{l.sets} × {l.reps}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">{new Date(l.ts).toLocaleDateString("pl")}</p>
              <EntryActions onEdit={() => startEdit(l)} onDelete={() => remove(l.id)} />
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-28">
            <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Street Workout</p>
                <h3 className="font-display text-2xl">Dodaj ćwiczenie</h3>
              </div>
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full bg-white/5"><X className="h-4 w-4" /></button>
            </div>
            <label className="mt-4 block rounded-2xl bg-white/[0.04] p-3">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Nazwa</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Pull-up" className="mt-1 w-full bg-transparent font-display text-lg outline-none placeholder:text-muted-foreground/40" />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block rounded-2xl bg-white/[0.04] p-3">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Serie</span>
                <input type="number" value={sets} onChange={(e) => setSets(e.target.value === "" ? "" : parseInt(e.target.value))} className="mt-1 w-full bg-transparent font-display text-xl outline-none" />
              </label>
              <label className="block rounded-2xl bg-white/[0.04] p-3">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Powt.</span>
                <input type="number" value={reps} onChange={(e) => setReps(e.target.value === "" ? "" : parseInt(e.target.value))} className="mt-1 w-full bg-transparent font-display text-xl outline-none" />
              </label>
            </div>
            <button onClick={save} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[var(--lime)] via-[var(--orange)] to-[var(--magenta)] py-3.5 text-sm font-semibold text-background glow-primary">
              <Activity className="mr-1 inline h-4 w-4" /> Zapisz
            </button>
          </div>
        </div>
      )}
    </main>
  );
}