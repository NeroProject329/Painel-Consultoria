import "./globals.css";

export const metadata = {
  title: "Painel — Troca de Números",
  description: "Administração de domínios e números do WhatsApp",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
