import "./globals.css";
import type { Metadata, Viewport } from "next";
import PwaRegistration from "@/components/PwaRegistration";
const baseURL = process.env.NEXT_PUBLIC_API_BASE || "https://troca-numeros-api-production.up.railway.app";

export const metadata: Metadata = {
  title: "Painel — Troca de Números",
  description: "Administração de domínios e números do WhatsApp",
  applicationName: "Painel de Números",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Números" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#07110d" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head><link rel="preconnect" href={baseURL} /><link rel="dns-prefetch" href={baseURL} /></head>
      <body><template data-design-contract="crm-main-bc9a15f" dangerouslySetInnerHTML={{ __html: "<!-- THESIS: WhatsApp domain operations in the confirmed CRM visual language. OWN-WORLD: dark green surfaces, mint controls, pale readable text, restrained borders. STORY: choose domains and numbers, confirm changes, see their actual status. FIRST VIEWPORT: compact navigation above the domain workspace; mobile wraps naturally. FORM: user-pinned crm-ads-whatsapp main/apps/web, bc9a15f. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md -->" }} />{children}<PwaRegistration /></body>
    </html>
  );
}
