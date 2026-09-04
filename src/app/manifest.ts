import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/", name: "Painel de Números", short_name: "Números",
    description: "Gerencie os números de WhatsApp dos seus domínios.",
    start_url: "/app", scope: "/", display: "standalone", lang: "pt-BR",
    background_color: "#07110d", theme_color: "#07110d",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
