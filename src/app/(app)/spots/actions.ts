"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";

export async function toggleFavorite(spotId: string, favorite: boolean) {
  const { supabase, user } = await requireSession();
  if (favorite) {
    await supabase.from("favorite_spots").upsert({ user_id: user.id, spot_id: spotId });
  } else {
    await supabase.from("favorite_spots").delete().eq("user_id", user.id).eq("spot_id", spotId);
  }
  revalidatePath("/spots");
}
