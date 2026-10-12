import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const TABS = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/utilisateurs", label: "Utilisateurs" },
  { href: "/admin/offres", label: "Offres" },
  { href: "/admin/spots", label: "Spots" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireSession();
  if (!profile.is_admin) notFound();
  return (
    <div>
      <nav className="-mx-4 mb-8 flex gap-2 overflow-x-auto border-b border-line px-4 pb-3" aria-label="Administration">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className="whitespace-nowrap rounded-full border border-line px-4 py-2 text-[0.95rem] hover:border-deep">
            {t.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
