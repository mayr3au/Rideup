import type { Metadata } from "next";
// Polices auto-hébergées (pas d'appel à Google Fonts)
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/instrument-sans";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "RIDE'UP — Coaching kitesurf et analyse vidéo",
    template: "%s | RIDE'UP",
  },
  description:
    "Envoie un clip de 20 secondes de ta figure et reçois une correction précise, des drills et une roadmap de progression en kitesurf.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
