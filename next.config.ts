import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-Tools-Overlay (Indikator unten in der Ecke) ausblenden
  devIndicators: false,
  experimental: {
    serverActions: {
      // Bild-Uploads im Backend erlauben (Standard wäre 1 MB).
      // Bilder werden zusätzlich schon im Browser verkleinert – das ist nur Puffer.
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
