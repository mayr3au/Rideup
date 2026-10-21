"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { switchSport } from "@/app/(app)/coach/actions";
import { SPORTS, type SportId } from "@/lib/sports";

/** Pastilles pour changer de sport actif. Affiché seulement si le rider en pratique plusieurs. */
export function SportSwitcher({ sports, active }: { sports: SportId[]; active: SportId }) {
  const path = usePathname();
  const [pending, start] = useTransition();
  if (sports.length < 2) return null;

  return (
    <div className="border-b border-line bg-spray/95 backdrop-blur">
      <nav aria-label="Sport" className="scroll-x mx-auto flex max-w-6xl items-center gap-2 px-5 py-2 sm:px-6">
        {sports.map((id) => {
          const on = id === active;
          return (
            <form
              key={id}
              action={(fd) => start(() => switchSport(fd))}
            >
              <input type="hidden" name="sport" value={id} />
              <input type="hidden" name="back" value={path} />
              <button
                aria-pressed={on}
                disabled={pending}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  on ? "bg-brand text-white" : "bg-raised text-deep hover:bg-brand-light"
                }`}
              >
                {SPORTS[id].name}
              </button>
            </form>
          );
        })}
        <Link href="/profil" className="ml-1 whitespace-nowrap px-2 text-sm font-semibold text-lagoon">
          + Sport
        </Link>
      </nav>
    </div>
  );
}
