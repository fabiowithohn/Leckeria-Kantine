import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-Tools-Overlay (Indikator unten in der Ecke) ausblenden
  devIndicators: false,
  // Fonts und Hintergrund der Planerstellung werden zur Laufzeit von der Platte
  // gelesen – beim Deployment müssen sie mit in die Server-Funktionen.
  outputFileTracingIncludes: {
    "/api/plan-image": ["./src/plan-assets/**/*", "./public/plan/**/*"],
    "/admin/planerstellung": ["./src/plan-assets/**/*", "./public/plan/**/*"],
  },
  experimental: {
    serverActions: {
      // Bild-Uploads im Backend erlauben (Standard wäre 1 MB).
      // Bilder werden zusätzlich schon im Browser verkleinert – das ist nur Puffer.
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
