import type { Metadata, Viewport } from "next";
// Police auto-hébergée (pas d'appel à Google Fonts)
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/plus-jakarta-sans/wght-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "RIDE'UP — Coach de glisse et analyse vidéo",
    template: "%s | RIDE'UP",
  },
  description:
    "Envoie un clip de 10 secondes de ta figure et reçois une correction précise, des drills et une roadmap de progression en kitesurf, wingfoil, foil, surf et wakeboard.",
  applicationName: "RIDE'UP",
  appleWebApp: { capable: true, title: "RIDE'UP", statusBarStyle: "default" },
  openGraph: {
    title: "RIDE'UP — Ton coach de glisse dans ta poche",
    description: "Envoie 10 secondes de ta figure : tu sais exactement quoi corriger. Kite, wing, foil, surf, wake.",
    type: "website",
    locale: "fr_FR",
    images: [{ url: "/hero-surf.jpg", width: 1199, height: 1495 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#1688c8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
