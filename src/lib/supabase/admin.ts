import "server-only";
import { createClient } from "@supabase/supabase-js";
import { DEMO_MODE } from "./env";
import { demoClient } from "./demo";

/**
 * Client avec la clé service_role : contourne la RLS.
 * À n'utiliser que côté serveur (webhook Stripe, tâches admin).
 */
function realAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export function createAdminClient() {
  if (DEMO_MODE) return demoClient() as unknown as ReturnType<typeof realAdminClient>;
  return realAdminClient();
}
