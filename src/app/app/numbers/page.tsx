"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, apiError } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import type { NumberItem } from "@/types/number";

type Domain = { _id: string; domain: string; isActive: boolean; activeNumberId?: string | null };
export default function NumbersPage() {
  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editing, setEditing] = useState<NumberItem | null>(null);
  const [deleting, setDeleting] = useState<NumberItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const load = useCallback(async () => {
    try {
      const [n, d] = await Promise.all([api.get("/admin/numbers"), api.get("/admin/domains")]);
      setNumbers(n.data.items); setDomains(d.data.items);
    } catch (e) { setError(apiError(e)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const filtered = useMemo(() => {
    const q = search.toLocaleLowerCase("pt-BR").trim(); const digits = q.replace(/\D/g, "");
    return numbers.filter(n => !q || n.name.toLocaleLowerCase("pt-BR").includes(q) || n.phone.includes(q) || (digits && n.phone.includes(digits)));
  }, [numbers, search]);
  async function create(event: React.FormEvent) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try { await api.post("/admin/numbers", { name: name.trim(), phone });
      setName(""); setPhone(""); setNotice("Número cadastrado e vinculado a todos os domínios. Nenhum número ativo foi alterado."); await load();
    } catch (e) { setError(apiError(e)); } finally { setBusy(false); }
  }
  async function save() {
    if (!editing || busy) return; setBusy(true); setError("");
    try { await api.patch("/admin/numbers/" + editing._id, { name: editName.trim(), phone: editPhone });
      setEditing(null); setNotice("Número atualizado."); await load();
    } catch (e) { setError(apiError(e)); } finally { setBusy(false); }
  }
  async function remove() {
    if (!deleting || busy) return; setBusy(true); setError("");
    try { await api.delete("/admin/numbers/" + deleting._id); setDeleting(null);
      setNotice("Número excluído. Os outros números ativos foram preservados."); await load();
    } catch (e) { setError(apiError(e)); } finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">Números</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">{numbers.length} cadastrados · disponíveis em todos os seus domínios</p></div>
      <button className="btn px-4 py-2 text-sm" disabled={busy} onClick={() => { setError(""); void load(); }}>Atualizar</button></header>
    {error && !editing && !deleting && <p role="alert" className="rounded-xl bg-[var(--danger-bg)] p-3 text-sm text-[var(--danger-text)]">{error}</p>}
    {notice && <p role="status" className="rounded-xl bg-[var(--success-bg)] p-3 text-sm text-[var(--success-text)]">{notice}</p>}
    <section className="card p-5"><h2 className="font-semibold">Cadastrar número</h2>
      <form onSubmit={create} className="mt-4 grid items-end gap-3 md:grid-cols-[1fr_1fr_auto]">
        <label className="text-sm">Atendente<input className="input mt-1 w-full" value={name} onChange={e => setName(e.target.value)} required minLength={2} placeholder="Nome do atendente" /></label>
        <label className="text-sm">Telefone<input className="input mt-1 w-full" type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} required minLength={8} placeholder="55 11 99999-9999" /></label>
        <button className="btn-primary rounded-xl px-5 py-2.5 text-sm" disabled={busy || !name.trim() || phone.replace(/\D/g, "").length < 8}>{busy ? "Salvando…" : "Cadastrar número"}</button>
      </form></section>
    <section><label className="block text-sm font-medium" htmlFor="number-search">Buscar número ou atendente</label>
      <input id="number-search" className="input mt-2 w-full" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Digite o telefone ou nome" />
      <p className="my-3 text-xs text-[var(--muted)]">{filtered.length} resultado(s)</p>
      {loading ? <p role="status">Carregando números…</p> : <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        {filtered.map(n => { const active = domains.filter(d => d.isActive && d.activeNumberId === n._id);
          return <article key={n._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0"><h2 className="font-semibold">{n.name}</h2><p className="text-sm tabular-nums text-[var(--muted)]">{n.phone}</p>
              <p className="mt-1 break-words text-xs text-[var(--muted)]">{active.length ? "Ativo em: " + active.map(d => d.domain).join(", ") : "Sem ativação no momento"}</p></div>
            <div className="flex shrink-0 gap-2"><button className="btn px-3 py-2 text-sm" disabled={busy} onClick={() => { setError(""); setEditing(n); setEditName(n.name); setEditPhone(n.phone); }}>Editar</button>
              <button className="btn-danger rounded-xl px-3 py-2 text-sm" disabled={busy} onClick={() => { setError(""); setDeleting(n); }}>Excluir</button></div>
          </article>; })}
        {!filtered.length && <p className="p-6 text-sm text-[var(--muted)]">{numbers.length ? "Nenhum número encontrado. Tente outra busca." : "Cadastre seu primeiro número acima."}</p>}
      </div>}
    </section>
    <Modal open={!!editing} title="Editar número" confirmText="Salvar alterações" busy={busy} onClose={() => { setEditing(null); setError(""); }} onConfirm={save}>
      <div className="space-y-3">{error && <p role="alert" className="text-sm text-[var(--danger-text)]">{error}</p>}
        <label className="block text-sm">Atendente<input className="input mt-1 w-full" value={editName} onChange={e => setEditName(e.target.value)} /></label>
        <label className="block text-sm">Telefone<input className="input mt-1 w-full" type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} /></label></div>
    </Modal>
    <Modal open={!!deleting} title="Excluir número?" description={deleting ? deleting.name + " · " + deleting.phone + ". Será removido de todos os domínios. Sites onde este número está ativo ficarão sem número ativo." : ""} danger busy={busy} confirmText="Excluir número" onClose={() => { setDeleting(null); setError(""); }} onConfirm={remove}>
      {error && <p role="alert" className="text-sm text-[var(--danger-text)]">{error}</p>}
    </Modal>
  </div>;
}
