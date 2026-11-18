import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pas de bulle « N » Next.js en bas à gauche : elle recouvre la barre d'onglets mobile en dev
  devIndicators: false,
  async redirects() {
    // « Le tantrum depuis le plat » est devenu « Bel Air » (audit avant lancement).
    return [{ source: "/cours/wake-tantrum", destination: "/cours/wake-bel-air", permanent: true }];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
