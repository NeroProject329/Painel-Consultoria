"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { DomainItem } from "@/types/domain";
import Link from "next/link";

export default function DomainsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<DomainItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [newDomain, setNewDomain] = useState("");
  const [creating, setCreating] = useState(false);
  

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const { data } = await api.get("/admin/domains");
      setItems(data?.items ?? []);
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Erro ao carregar domínios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const activeCount = useMemo(
    () => items.filter((d) => d.isActive).length,
    [items]
  );

  function goBack() {
  if (window.history.length > 1) router.back();
  else router.push("/app");
 }

  async function createDomain() {
    const value = newDomain.trim();
    if (!value) return;

    setCreating(true);
    setErr(null);

    try {
      const { data } = await api.post("/admin/domains", { domain: value });
      if (!data?.ok) throw new Error("Falha ao criar domínio");
      setNewDomain("");
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || e?.message || "Erro ao criar domínio.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Domínios</h1>
          <p className="text-sm text-neutral-600">
            {items.length} total • {activeCount} ativos
          </p>
        </div>

        <div className="flex w-full max-w-xl gap-2">
            <Link
      href="/app"
      className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
    >
      <span aria-hidden>←</span> Voltar
    </Link>

          <input
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="ex: meusite.com"
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
          />
          <button
            onClick={createDomain}
            disabled={creating || !newDomain.trim()}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {creating ? "Criando..." : "Cadastrar"}
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
          {items.map((d) => (
            <button
              key={d._id}
              onClick={() => router.push(`/app/domains/${d._id}`)}
              className="text-left rounded-2xl border border-neutral-200 bg-white p-4 hover:bg-neutral-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-neutral-500">Domínio</div>
                  <div className="text-base font-semibold text-neutral-900">
                    {d.domain}
                  </div>
                </div>

                {d.isActive ? (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                    Ativo
                  </span>
                ) : (
                  <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-neutral-600">
                    Inativo
                  </span>
                )}
              </div>

              <div className="mt-3 text-xs text-neutral-500">
                Clique para gerenciar números e ativação
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
