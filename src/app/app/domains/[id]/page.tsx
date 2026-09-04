"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api, apiError } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import type { DomainDetail, DomainNumberDetail } from "@/types/domainDetail";
import type { NumberItem } from "@/types/number";

export default function DomainDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<DomainDetail | null>(null);
  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("");
  const [allOpen, setAllOpen] = useState(false);
  const [editing, setEditing] = useState<DomainNumberDetail | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const load = useCallback(async () => {
    try {
      const [d, n] = await Promise.all([api.get("/admin/domains/" + id), api.get("/admin/numbers")]);
      setDetail(d.data.item); setNumbers(n.data.items);
    } catch (e) { setError(apiError(e)); } finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);
  async function mutate(work: () => Promise<unknown>, message: string, done?: () => void) {
    if (busy) return; setBusy(true); setError(""); setNotice("");
    try { await work(); done?.(); setNotice(message); await load(); }
    catch (e) { setError(apiError(e)); } finally { setBusy(false); }
  }
  const available = numbers.filter(n => !detail?.numbers.some(linked => linked.id === n._id));
  const q = search.trim().toLowerCase(), digits = q.replace(/\D/g, "");
  const filtered = detail?.numbers.filter(n => !q || n.name.toLowerCase().includes(q) || n.phone.includes(q) || (digits && n.phone.includes(digits))) ?? [];
  const active = detail?.numbers.find(n => n.id === detail.activeNumberId);
  if (loading) return <p role="status" className="p-6 text-sm">Carregando domínio…</p>;
  if (!detail) return <div className="p-6"><p role="alert">{error || "Domínio não encontrado."}</p><Link className="mt-4 inline-block underline" href="/app/domains">Voltar para domínios</Link></div>;
  return <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
    <header><Link className="text-sm text-[var(--muted)] underline underline-offset-4" href="/app/domains">Voltar para domínios</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><h1 className="break-all text-2xl font-semibold">{detail.domain}</h1><p className="mt-1 text-sm text-[var(--muted)]">Gerencie o número ativo e os atendentes disponíveis.</p></div>
        <button className="btn px-4 py-2 text-sm" disabled={busy} onClick={() => { setError(""); void load(); }}>Atualizar</button></div></header>
    {error && !editing && !allOpen && <p role="alert" className="rounded-xl bg-[var(--danger-bg)] p-3 text-sm text-[var(--danger-text)]">{error}</p>}
    {notice && <p role="status" className="rounded-xl bg-[var(--success-bg)] p-3 text-sm text-[var(--success-text)]">{notice}</p>}
    <section className="card p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Status do domínio</h2>
      <label className="flex items-center gap-2 text-sm"><input className="h-4 w-4 accent-[var(--brand)]" type="checkbox" checked={detail.isActive} disabled={busy} onChange={e => { const checked = e.target.checked; void mutate(() => api.patch("/admin/domains/" + id, { isActive: checked }), checked ? "Domínio ativado." : "Domínio desativado."); }} />Domínio ativo</label></div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5"><div><p className="text-xs text-[var(--muted)]">Número ativo</p><p className="mt-1 font-semibold">{active ? active.name + " · " + active.phone : "Sem número ativo"}</p></div>
        {active && <button className="btn px-4 py-2 text-sm" disabled={busy} onClick={() => void mutate(() => api.patch("/admin/domains/" + id + "/active-number", { numberId: null }), "Número desativado neste domínio.")}>Desativar número</button>}</div>
    </section>
    <section className="card p-5"><h2 className="text-lg font-semibold">Números disponíveis</h2><p className="mt-1 text-sm text-[var(--muted)]">Novos números entram automaticamente. Você também pode restaurar vínculos removidos.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row"><label className="min-w-0 flex-1 text-sm">Vincular um número<select className="input mt-1 w-full" value={selected} onChange={e => setSelected(e.target.value)} disabled={busy}><option value="">Selecione um número</option>{available.map(n => <option key={n._id} value={n._id}>{n.name} · {n.phone}</option>)}</select></label>
        <div className="flex items-end gap-2"><button className="btn px-4 py-2.5 text-sm" disabled={busy || !selected} onClick={() => void mutate(() => api.post("/admin/domains/" + id + "/numbers", { numberId: selected }), "Número vinculado.", () => setSelected(""))}>Vincular</button>
          <button className="btn-primary rounded-xl px-4 py-2.5 text-sm" disabled={busy || !available.length} onClick={() => { setError(""); setAllOpen(true); }}>Vincular todos ({available.length})</button></div></div>
    </section>
    <section><label className="block text-sm font-medium">Pesquisar neste domínio<input className="input mt-2 w-full" type="search" placeholder="Telefone ou atendente" value={search} onChange={e => setSearch(e.target.value)} /></label>
      <p className="my-3 text-xs text-[var(--muted)]">{filtered.length} de {detail.numbers.length} número(s)</p>
      <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">{filtered.map(n => <article className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" key={n.id}>
        <div className="min-w-0"><h2 className="font-semibold">{n.name}</h2><p className="text-sm tabular-nums text-[var(--muted)]">{n.phone}</p>
          {n.isActiveHere && <span className="mt-1 inline-block text-xs font-medium text-[var(--success-text)]">Ativo neste domínio</span>}
          {!!n.activeInDomains.filter(d => d.id !== id).length && <p className="mt-1 break-words text-xs text-[var(--muted)]">Também ativo: {n.activeInDomains.filter(d => d.id !== id).map(d => d.domain).join(", ")}</p>}</div>
        <div className="flex shrink-0 flex-wrap gap-2"><button className="btn-primary rounded-xl px-3 py-2 text-sm" disabled={busy || !detail.isActive || n.isActiveHere} onClick={() => void mutate(() => api.patch("/admin/domains/" + id + "/active-number", { numberId: n.id }), "Número ativado neste domínio.")}>{n.isActiveHere ? "Ativo" : "Ativar"}</button>
          <button className="btn px-3 py-2 text-sm" disabled={busy} onClick={() => { setError(""); setEditing(n); setEditName(n.name); setEditPhone(n.phone); }}>Editar</button>
          <button className="btn-danger rounded-xl px-3 py-2 text-sm" disabled={busy} onClick={() => void mutate(() => api.delete("/admin/domains/" + id + "/numbers/" + n.id), "Número desvinculado deste domínio.")}>Desvincular</button></div>
      </article>)}{!filtered.length && <p className="p-6 text-sm text-[var(--muted)]">Nenhum número encontrado. Ajuste a busca ou vincule um número acima.</p>}</div></section>
    <Modal open={allOpen} title="Vincular todos os números?" description={available.length + " número(s) serão vinculados a " + detail.domain + ". O número ativo não será alterado."} busy={busy} confirmText="Vincular todos" onClose={() => { setAllOpen(false); setError(""); }} onConfirm={() => void mutate(() => api.post("/admin/domains/" + id + "/numbers/all"), "Todos os números foram vinculados.", () => setAllOpen(false))}>
      {error && <p role="alert" className="text-sm text-[var(--danger-text)]">{error}</p>}
    </Modal>
    <Modal open={!!editing} title="Editar número" confirmText="Salvar alterações" busy={busy} onClose={() => { setEditing(null); setError(""); }} onConfirm={() => { if (editing) void mutate(() => api.patch("/admin/numbers/" + editing.id, { name: editName.trim(), phone: editPhone }), "Número atualizado em todos os domínios.", () => setEditing(null)); }}>
      <div className="space-y-3">{error && <p role="alert" className="text-sm text-[var(--danger-text)]">{error}</p>}<label className="block text-sm">Atendente<input className="input mt-1 w-full" value={editName} onChange={e => setEditName(e.target.value)} /></label><label className="block text-sm">Telefone<input type="tel" className="input mt-1 w-full" value={editPhone} onChange={e => setEditPhone(e.target.value)} /></label></div>
    </Modal>
  </div>;
}
