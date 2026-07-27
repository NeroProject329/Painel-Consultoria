"use client";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import { gsap } from "gsap";

import { clearToken } from "@/lib/auth";

const NAV = [
  {
    href: "/app",
    label: "Dashboard",
  },

  {
    href: "/app/domains",
    label: "Domínios",
  },

  {
    href: "/app/numbers",
    label: "Números",
  },

  {
    href: "/app/metrics",
    label: "Métricas",
  },

  {
    href: "/app/monitoring",
    label: "Monitoramento",
  },
];

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const headerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const mainRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const activeHref =
    useMemo(() => {
      if (!pathname) {
        return "/app";
      }

      if (
        pathname.startsWith(
          "/app/domains"
        )
      ) {
        return "/app/domains";
      }

      if (
        pathname.startsWith(
          "/app/numbers"
        )
      ) {
        return "/app/numbers";
      }

      if (
        pathname.startsWith(
          "/app/metrics"
        )
      ) {
        return "/app/metrics";
      }

      if (
        pathname.startsWith(
          "/app/monitoring"
        )
      ) {
        return "/app/monitoring";
      }

      return "/app";
    }, [pathname]);

  useEffect(() => {
    if (
      headerRef.current
    ) {
      gsap.fromTo(
        headerRef.current,

        {
          y: -10,
          opacity: 0,
        },

        {
          y: 0,
          opacity: 1,

          duration: 0.55,

          ease:
            "power2.out",
        }
      );
    }

    if (
      mainRef.current
    ) {
      gsap.fromTo(
        mainRef.current,

        {
          y: 14,
          opacity: 0,
        },

        {
          y: 0,
          opacity: 1,

          duration: 0.65,

          ease:
            "power2.out",

          delay: 0.08,
        }
      );
    }
  }, [activeHref]);

  function logout() {
    clearToken();

    router.replace(
      "/login"
    );
  }

  function renderNavItem(
    item: (typeof NAV)[number]
  ) {
    const active =
      activeHref ===
      item.href;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={[
          "whitespace-nowrap rounded-xl px-3 py-2 text-sm transition",

          active
            ? "text-white"
            : "text-[var(--muted)] hover:text-[var(--text)]",
        ].join(" ")}
        style={
          active
            ? {
                background:
                  "linear-gradient(180deg, var(--brand), var(--brand-2))",

                boxShadow:
                  "0 14px 40px rgba(0,145,235,0.20)",
              }
            : undefined
        }
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="app-bg">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div
          ref={headerRef}
          className="card flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,145,235,1), rgba(0,119,200,1))",

                  boxShadow:
                    "0 18px 55px rgba(0,145,235,0.22)",
                }}
              />

              <div>
                <div className="text-sm font-semibold text-[var(--text)]">
                  Painel — Troca
                  de Números
                </div>

                <div className="text-xs text-[var(--muted)]">
                  Futuristic Blue
                  • Admin
                </div>
              </div>
            </div>

            <button
              onClick={
                logout
              }
              className="btn px-3 py-2 text-sm md:hidden"
            >
              Sair
            </button>
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pb-1 md:overflow-visible md:pb-0">
              {NAV.map(
                renderNavItem
              )}
            </nav>

            <button
              onClick={
                logout
              }
              className="btn hidden px-3 py-2 text-sm md:block"
            >
              Sair
            </button>
          </div>
        </div>

        <div
          ref={mainRef}
          className="mt-4"
        >
          {children}
        </div>
      </div>
    </div>
  );
}