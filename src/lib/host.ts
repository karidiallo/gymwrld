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

/** Keep auth/app navigation on the current host so Google OAuth and installed PWA sessions stay on one origin. */
export function appUrl(path = "/"): string {
  return path;
}