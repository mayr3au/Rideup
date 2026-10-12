import type { Metadata } from "next";
// Police auto-hébergée (pas d'appel à Google Fonts)
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "RIDE'UP — Coach de glisse et analyse vidéo",
    template: "%s | RIDE'UP",
  },
  description:
    "Envoie un clip de 20 secondes de ta figure et reçois une correction précise, des drills et une roadmap de progression en kitesurf, wingfoil, foil, surf et wakeboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
