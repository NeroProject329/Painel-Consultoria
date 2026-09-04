"use client";

import { useEffect, useState } from "react";
import { api, apiError } from "@/lib/api";
import type { DomainItem } from "@/types/domain";
import Link from "next/link";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<DomainItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const { data } = await api.get("/admin/domains/dashboard/active");
      setItems(data?.items ?? []);
    } catch (error: unknown) {
      setErr(apiError(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);


  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Dashboard</h1>
          <p className="text-sm text-[var(--muted)]">
            Domínios ativos e número ativo atual
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm hover:bg-[var(--surface-2)]"
          >
            Recarregar
          </button>

      
        </div>
      </div>

      {err && (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--danger-bg)] p-3 text-sm text-[var(--danger-text)]">
          {err}
        </div>
      )}

      {loading ? (
        <div className="mt-6 text-sm text-[var(--muted)]">Carregando…</div>
      ) : (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {!items.length && <p className="text-sm text-[var(--muted)]">Nenhum domínio ativo. Cadastre um na página de domínios.</p>}
          {items.map((d) => {
            const n = d.activeNumberId;
            return (
              <Link
                key={d._id}
                href={`/app/domains/${d._id}`}
                className="dashboard-domain rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-[var(--muted)]">Domínio</div>
                    <div className="break-all text-base font-semibold text-[var(--text)]">
                      {d.domain}
                    </div>
                  </div>
                  <span className="rounded-full bg-[var(--success-bg)] px-2 py-1 text-xs text-[var(--success-text)] border border-[var(--border)]">
                    Ativo
                  </span>
                </div>

                <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                  <div className="text-xs text-[var(--muted)]">Número ativo</div>
                  {n ? (
                    <div className="mt-1">
                      <div className="text-sm font-medium text-[var(--text)]">
                        {n.phone}
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        Atendente: {n.name}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-[var(--muted)]">
                      Sem número ativo
                    </div>
                  )}
                </div>

               
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
