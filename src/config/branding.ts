/**
 * Central branding configuration.
 * Update brand identity here; the rest of the app reads from this module so
 * the name/tagline is never hardcoded in components.
 */
export const BRAND = {
  name: "PatronFlow",
  tagline: "Turn Guests Into Loyal Patrons.",
  category: "Restaurant Growth Platform",
  description:
    "PatronFlow is the restaurant growth platform that turns guests into loyal patrons — grow reviews, loyalty, and repeat visits.",
} as const;

/** e.g. "PatronFlow — Restaurant Growth Platform" */
export const BRAND_TITLE = `${BRAND.name} — ${BRAND.category}`;
