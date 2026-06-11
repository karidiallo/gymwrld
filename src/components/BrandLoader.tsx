import logoAsset from "@/assets/gymwrld-logo.png.asset.json";

export function BrandLoader({ label = "Ładowanie…" }: { label?: string }) {
  return (
    <div className="grid place-items-center py-10">
      <img
        src={logoAsset.url}
        alt="GymWRLD"
        className="h-14 w-auto animate-pulse"
        style={{ filter: "drop-shadow(0 0 24px rgba(255,140,60,0.45))" }}
      />
      <p className="mt-3 text-[10px] uppercase tracking-[0.32em] text-muted-foreground">{label}</p>
    </div>
  );
}

export function BrandFooter() {
  return (
    <footer className="mt-12 mb-24 flex flex-col items-center gap-2 opacity-80">
      <img src={logoAsset.url} alt="GymWRLD" className="h-20 w-auto" />
      <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">v1.0</p>
    </footer>
  );
}