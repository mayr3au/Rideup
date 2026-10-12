import type { Metadata } from "next";
import { requireSession, effectivePlan } from "@/lib/auth";
import { ProfileForm } from "@/components/profile-form";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const { profile } = await requireSession();
  const first = !profile.onboarded;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-4xl font-bold sm:text-5xl">{first ? "Crée ton profil rider" : "Ton profil"}</h1>
      <p className="mt-3 text-slate">
        {first
          ? "Deux minutes. Ton niveau, ton poids et ton matériel servent à adapter les analyses, la roadmap et le choix des spots."
          : "Ces informations adaptent tes analyses, ton coach et le Spot Finder."}
      </p>
      <div className="mt-8">
        <ProfileForm
          profile={profile}
          submitLabel={first ? "Créer mon profil" : "Enregistrer"}
          showAlerts={effectivePlan(profile) === "elite"}
        />
      </div>
    </div>
  );
}
