/**
 * Sans configuration Supabase (aperçu, première mise en ligne), on utilise des valeurs factices :
 * les pages publiques s'affichent et les requêtes échouent proprement au lieu de faire planter le site.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
export const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"),
);

/**
 * Mode démo : un faux compte Elite déjà rempli, uniquement en local (jamais en production).
 * Actif sans Supabase, ou forcé avec `npm run dev:demo` (NEXT_PUBLIC_RIDEUP_DEMO=1) même si .env.local est rempli.
 */
export const DEMO_MODE =
  process.env.NODE_ENV === "development" && (process.env.NEXT_PUBLIC_RIDEUP_DEMO === "1" || !SUPABASE_CONFIGURED);
