"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { clearToken } from "@/lib/auth";

const NAV = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/domains", label: "Domínios" },
  { href: "/app/numbers", label: "Números" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const headerRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);

  const activeHref = useMemo(() => {
    if (!pathname) return "/app";
    if (pathname.startsWith("/app/domains")) return "/app/domains";
    if (pathname.startsWith("/app/numbers")) return "/app/numbers";
    return "/app";
  }, [pathname]);

  useEffect(() => {
    // animação suave futurista
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: "power2.out" }
      );
    }
    if (mainRef.current) {
      gsap.fromTo(
        mainRef.current,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: "power2.out", delay: 0.08 }
      );
    }
  }, [activeHref]);

  function logout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <div className="app-bg">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Topbar */}
        <div
          ref={headerRef}
          className="card px-4 py-3 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,145,235,1), rgba(0,119,200,1))",
                boxShadow: "0 18px 55px rgba(0,145,235,0.22)",
              }}
            />
            <div>
              <div className="text-sm font-semibold text-[var(--text)]">
                Painel — Troca de Números
              </div>
              <div className="text-xs text-[var(--muted)]">
                Futuristic Blue • Admin
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map((item) => {
                const active = activeHref === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "px-3 py-2 rounded-xl text-sm transition",
                      active
                        ? "text-white"
                        : "text-[var(--muted)] hover:text-[var(--text)]",
                    ].join(" ")}
                    style={
                      active
                        ? {
                            background:
                              "linear-gradient(180deg, var(--brand), var(--brand-2))",
                            boxShadow: "0 14px 40px rgba(0,145,235,0.20)",
                          }
                        : undefined
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button onClick={logout} className="btn px-3 py-2 text-sm">
              Sair
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div ref={mainRef} className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
