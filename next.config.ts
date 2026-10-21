import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pas de bulle « N » Next.js en bas à gauche : elle recouvre la barre d'onglets mobile en dev
  devIndicators: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
