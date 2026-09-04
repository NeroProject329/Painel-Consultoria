"use client";

import { useEffect, useMemo, useState } from "react";
import { api, apiError } from "@/lib/api";
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
    } catch (e: unknown) {
      setErr(apiError(e, "Erro ao carregar domínios."));
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
    } catch (e: unknown) {
      setErr(apiError(e, "Erro ao criar domínio."));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Domínios</h1>
          <p className="text-sm text-[var(--muted)]">
            {items.length} total • {activeCount} ativos
          </p>
        </div>

        <div className="flex w-full max-w-xl gap-2">
            <Link
      href="/app"
      className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"
    >
      <span aria-hidden>←</span> Voltar
    </Link>

          <input
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            aria-label="Novo domínio"
            placeholder="ex: meusite.com"
            className="min-w-0 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--border)]"
          />
          <button
            onClick={createDomain}
            disabled={creating || !newDomain.trim()}
            className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-medium text-[var(--on-brand)] hover:bg-[var(--brand)] disabled:opacity-60"
          >
            {creating ? "Criando..." : "Cadastrar"}
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
          {items.map((d) => (
            <button
              key={d._id}
              onClick={() => router.push(`/app/domains/${d._id}`)}
              className="text-left rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:bg-[var(--surface-2)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-[var(--muted)]">Domínio</div>
                  <div className="text-base font-semibold text-[var(--text)]">
                    {d.domain}
                  </div>
                </div>

                {d.isActive ? (
                  <span className="rounded-full border border-[var(--border)] bg-[var(--success-bg)] px-2 py-1 text-xs text-[var(--success-text)]">
                    Ativo
                  </span>
                ) : (
                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs text-[var(--muted)]">
                    Inativo
                  </span>
                )}
              </div>

              <div className="mt-3 text-xs text-[var(--muted)]">
                Clique para gerenciar números e ativação
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
