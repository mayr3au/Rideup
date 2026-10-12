import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client avec la clé service_role : contourne la RLS.
 * À n'utiliser que côté serveur (webhook Stripe, tâches admin).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
