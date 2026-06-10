import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, MapPin, Star, ExternalLink, Phone } from "lucide-react";

export const Route = createFileRoute("/fizjo")({
  head: () => ({ meta: [
    { title: "Fizjoterapeuci — GymWRLD" },
    { name: "description", content: "Lista polecanych fizjoterapeutów w Twoim mieście." },
  ]}),
  component: FizjoPage,
});

type Phys = {
  name: string;
  city: string;
  rating: number;
  reviews: number;
  specialty: string;
  price: string;
  link: string;
  phone?: string;
};

const PHYSIOS: Phys[] = [
  { name: "Dr Tomasz Kowalski", city: "Warszawa", rating: 4.9, reviews: 312, specialty: "Sport · kolano · kręgosłup", price: "180 zł / 60 min", link: "https://www.znanylekarz.pl/", phone: "+48 22 000 00 00" },
  { name: "mgr Anna Wiśniewska", city: "Warszawa", rating: 4.8, reviews: 248, specialty: "Bieganie · biomechanika", price: "200 zł / 60 min", link: "https://booksy.com/pl-pl/" },
  { name: "Studio FizjoMove", city: "Kraków", rating: 4.9, reviews: 421, specialty: "Powięź · trening medyczny", price: "190 zł / 60 min", link: "https://www.znanylekarz.pl/" },
  { name: "mgr Paweł Nowak", city: "Wrocław", rating: 4.7, reviews: 187, specialty: "Bark · obręcz · siłownia", price: "170 zł / 60 min", link: "https://booksy.com/pl-pl/" },
  { name: "RehaPro Trójmiasto", city: "Gdańsk", rating: 4.8, reviews: 295, specialty: "Pourazowa · ACL · meniscus", price: "210 zł / 60 min", link: "https://www.znanylekarz.pl/" },
  { name: "mgr Karolina Lewandowska", city: "Poznań", rating: 4.9, reviews: 264, specialty: "Kobieta · dno miednicy · ciąża", price: "180 zł / 60 min", link: "https://booksy.com/pl-pl/" },
  { name: "Studio Kineza", city: "Łódź", rating: 4.6, reviews: 142, specialty: "Kalistenika · stawy nadgarstków", price: "160 zł / 60 min", link: "https://www.znanylekarz.pl/" },
  { name: "mgr Marek Zieliński", city: "Katowice", rating: 4.8, reviews: 198, specialty: "Trening siłowy · plecy", price: "170 zł / 60 min", link: "https://booksy.com/pl-pl/" },
];

function FizjoPage() {
  return (
    <main className="px-5 pt-6 pb-32">
      <header className="flex items-center justify-between">
        <Link to="/profil" className="grid h-9 w-9 place-items-center rounded-full glass">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-xl">Fizjoterapeuci</h1>
        <div className="h-9 w-9" />
      </header>

      <section className="mt-5 rounded-3xl bg-gradient-to-br from-[var(--magenta)]/25 via-[var(--orange)]/15 to-transparent p-[1px]">
        <div className="rounded-3xl bg-black/55 p-5 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-widest text-[var(--orange)]">Masz kontuzję?</p>
          <h2 className="mt-1 font-display text-2xl leading-tight">Najlepiej oceniani specjaliści w Polsce</h2>
          <p className="mt-1.5 text-xs text-muted-foreground">Bazujemy na opiniach z ZnanyLekarz, Booksy i Google. Lista aktualizowana co miesiąc.</p>
        </div>
      </section>

      <div className="mt-5 space-y-2.5">
        {PHYSIOS.map((p) => (
          <div key={p.name} className="rounded-2xl glass p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-semibold leading-tight">{p.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {p.city} · {p.specialty}
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-[var(--orange)]/15 px-2 py-1 text-[11px] font-semibold text-[var(--orange)]">
                <Star className="h-3 w-3 fill-current" /> {p.rating.toFixed(1)}
                <span className="ml-1 text-muted-foreground">({p.reviews})</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">{p.price}</p>
              <div className="flex gap-2">
                {p.phone && (
                  <a href={`tel:${p.phone}`} className="inline-flex items-center gap-1 rounded-full glass px-3 py-1.5 text-[11px]">
                    <Phone className="h-3 w-3" /> Zadzwoń
                  </a>
                )}
                <a href={p.link} target="_blank" rel="noopener" className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[var(--magenta)] to-[var(--orange)] px-3 py-1.5 text-[11px] font-semibold text-background">
                  Umów wizytę <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-[10px] text-muted-foreground">
        Chcesz znaleźć się na liście? Napisz: partnerships@gymwrld.com
      </p>
    </main>
  );
}