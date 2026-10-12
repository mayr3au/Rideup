"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";

export async function deleteAnalysis(formData: FormData) {
  const id = String(formData.get("id"));
  const { supabase } = await requireSession();

  const { data } = await supabase.from("video_analyses").select("video_path").eq("id", id).single();
  if (data?.video_path) await supabase.storage.from("clips").remove([data.video_path]);
  await supabase.from("video_analyses").delete().eq("id", id);

  redirect("/analyse");
}
