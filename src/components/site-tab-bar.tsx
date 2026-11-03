"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEMO_MODE } from "@/lib/supabase/env";
import { AppTabBar } from "./app-nav";

/**
 * Sur les cours (pages publiques), un rider connecté garde la barre d'onglets de l'appli.
 * Vérifié dans le navigateur pour que les pages de cours restent statiques.
 */
export function SiteTabBar() {
  const path = usePathname();
  const [signedIn, setSignedIn] = useState(DEMO_MODE);

  useEffect(() => {
    if (DEMO_MODE) return;
    createClient()
      .auth.getSession()
      .then(({ data }) => setSignedIn(Boolean(data.session)))
      .catch(() => {});
  }, []);

  if (!signedIn || !path.startsWith("/cours")) return null;
  return (
    <>
      <div aria-hidden="true" className="h-24 lg:hidden" />
      <AppTabBar />
    </>
  );
}
