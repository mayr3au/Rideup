"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";

export async function deleteAnalysis(formData: FormData) {
  const id = String(formData.get("id"));
  const { supabase } = await requireSession();

  const { data } = await supabase.from("video_analyses").select("video_path").eq("id", id).single();
  await supabase.from("video_analyses").delete().eq("id", id);

  // Le même clip peut servir à plusieurs analyses : on ne supprime le fichier qu'en dernier.
  if (data?.video_path) {
    const { count } = await supabase
      .from("video_analyses")
      .select("id", { count: "exact", head: true })
      .eq("video_path", data.video_path);
    if (!count) await supabase.storage.from("clips").remove([data.video_path]);
  }

  redirect("/historique");
}
