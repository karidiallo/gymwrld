/**
 * Host-aware routing helpers.
 * - apex (gymwrld.com / www.gymwrld.com) = landing page only
 * - app.gymwrld.com / preview / localhost = full PWA
 */
export function getHostKind(): "landing" | "app" {
  if (typeof window === "undefined") return "app";
  const h = window.location.hostname.toLowerCase();
  if (h === "gymwrld.com" || h === "www.gymwrld.com") return "landing";
  return "app";
}

/** Absolute URL to the canonical app host, used for "Open app" CTAs from landing. */
export function appUrl(path = "/"): string {
  if (typeof window === "undefined") return path;
  if (getHostKind() === "landing") return `https://app.gymwrld.com${path}`;
  return path;
}