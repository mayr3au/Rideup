import Image from "next/image";
import Link from "next/link";
import { TEAM } from "@/lib/coaches";
import type { SportId } from "@/lib/sports";

/** Visages des coachs en petites pastilles rondes : on voit que ce sont de vraies personnes qui regardent les vidéos. */
export function CoachAvatars({ sport, className = "" }: { sport?: SportId; className?: string }) {
  const team = TEAM.filter((c) => c.name);
  if (!team.length) return null;
  // Les coachs du sport en cours d'abord
  const sorted = sport ? [...team].sort((a, b) => Number(b.sports.includes(sport)) - Number(a.sports.includes(sport))) : team;
  const names = sorted.map((c) => c.name.split(" ")[0]);
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} et ${names.at(-1)}` : names[0];

  return (
    <Link href="/#equipe" className={`group inline-flex items-center gap-3 rounded-full bg-white py-1.5 pl-1.5 pr-4 shadow-sm ring-1 ring-line hover:ring-brand ${className}`}>
      <span className="flex -space-x-2.5">
        {sorted.map((c) => (
          <span key={c.name} className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-white">
            <Image src={c.avatar} alt={c.name} fill sizes="36px" className="object-cover" />
          </span>
        ))}
      </span>
      <span className="text-sm leading-tight">
        <span className="font-semibold text-deep">{list}</span>
        <span className="block text-xs text-slate">regardent tes vidéos · <span className="text-lagoon group-hover:underline">voir l&apos;équipe</span></span>
      </span>
    </Link>
  );
}
