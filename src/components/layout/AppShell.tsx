"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";
import PanelMark from "@/components/PanelMark";

const NAV = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/domains", label: "Domínios" },
  { href: "/app/numbers", label: "Números" },
  { href: "/app/bulk", label: "Troca em vários sites" },
  { href: "/app/metrics", label: "Métricas" },
  { href: "/app/monitoring", label: "Monitoramento" },
  { href: "/app/settings", label: "Configurações" },
];
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  function logout() { clearToken(); router.replace("/login"); }
  return (
    <div className="app-bg">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-[var(--surface)] focus:p-3">Ir para o conteúdo</a>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="card px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <Link href="/app" className="flex items-center gap-3 text-sm font-semibold text-[var(--text)]"><PanelMark /><span>Painel — Troca de Números<span className="mt-1 block text-xs font-normal text-[var(--muted)]">Domínios e WhatsApp</span></span></Link>
            <button onClick={logout} className="btn px-3 py-2 text-sm">Sair</button>
          </div>
          <nav aria-label="Navegação principal" className="panel-nav">
            {NAV.map((item) => {
              const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
              return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
                >{item.label}</Link>;
            })}
          </nav>
        </header>
        <main id="main-content" className="mt-4">{children}</main>
      </div>
    </div>
  );
}
