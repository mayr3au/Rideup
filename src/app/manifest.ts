import type { MetadataRoute } from "next";

/** Manifeste PWA : RIDE'UP s'ajoute à l'écran d'accueil comme une appli. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RIDE'UP — Progress your ride",
    short_name: "RIDE'UP",
    description: "Ton coach de glisse dans ta poche : analyse vidéo, roadmap, Spot Finder.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f3f7fa",
    theme_color: "#1688c8",
    lang: "fr",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
