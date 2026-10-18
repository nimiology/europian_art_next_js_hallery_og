// Canonical origin: explicit override, else Vercel's production domain (set automatically), else local dev.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "Hallery";
export const SITE_DESCRIPTION =
  "A quiet, museum-style browser for 51,459 European artworks. Search and filter by artist, medium, year and collection, and view every work up close.";
