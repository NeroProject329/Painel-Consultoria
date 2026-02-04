"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import type { DomainItem } from "@/types/domain";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<DomainItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const { data } = await api.get("/admin/domains/dashboard/active");
      setItems(data?.items ?? []);
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Erro ao carregar dashboard.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function logout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-600">
            Domínios ativos e número ativo atual
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={load}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
          >
            Recarregar
          </button>

      
        </div>
      </div>

      {err && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {loading ? (
        <div className="mt-6 text-sm text-neutral-600">Carregando…</div>
      ) : (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {items.map((d) => {
            const n = d.activeNumberId;
            return (
              <div
                key={d._id}
                className="rounded-2xl border border-neutral-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-neutral-500">Domínio</div>
                    <div className="text-base font-semibold text-neutral-900">
                      {d.domain}
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700 border border-emerald-200">
                    Ativo
                  </span>
                </div>

                <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-xs text-neutral-500">Número ativo</div>
                  {n ? (
                    <div className="mt-1">
                      <div className="text-sm font-medium text-neutral-900">
                        {n.phone}
                      </div>
                      <div className="text-xs text-neutral-600">
                        Atendente: {n.name}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-neutral-600">
                      Sem número ativo
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs text-neutral-500">
                  Próximo: tela de detalhes do domínio (/app/domains/[id])
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
