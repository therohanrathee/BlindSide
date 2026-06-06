import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BlindSide — Blind Dating for Your University",
    short_name: "BlindSide",
    description:
      "The verified blind dating platform for university students. No photos, no swiping — just real connections.",
    start_url: "/",
    display: "standalone",
    background_color: "#0e1117",
    theme_color: "#e83a72",
    orientation: "portrait",
    categories: ["social", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
