"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, apiError } from "@/lib/api";
import type { NumberItem } from "@/types/number";
import type { DomainItem } from "@/types/domain";
import Modal from "@/components/ui/Modal";

export default function BulkPage() {
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [numberId, setNumberId] = useState("");
  const [query, setQuery] = useState("");
  const [domainQuery, setDomainQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [action, setAction] = useState<boolean | null>(null);
  const load = useCallback(async () => {
    try {
      const [d, n] = await Promise.all([api.get("/admin/domains/dashboard/active"), api.get("/admin/numbers")]);
      setDomains(d.data.items); setNumbers(n.data.items);
      setSelected(previous => previous.filter(id => d.data.items.some((item: DomainItem) => item._id === id)));
    } catch (e) { setError(apiError(e)); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const filteredDomains = domains.filter(d => d.domain.toLowerCase().includes(domainQuery.toLowerCase()));
  const filteredNumbers = useMemo(() => {
    const q = query.trim().toLowerCase(), digits = q.replace(/\D/g, "");
    return numbers.filter(n => !q || n.name.toLowerCase().includes(q) || n.phone.includes(q) || (digits && n.phone.includes(digits)));
  }, [numbers, query]);
  const number = numbers.find(n => n._id === numberId);
  function toggle(id: string) { setSelected(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]); }
  async function apply() {
    if (action === null || !number || !selected.length || busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const { data } = await api.patch("/admin/domains/bulk-active-number", { domainIds: selected, numberId, active: action });
      setNotice(action ? `Número ativado nos ${data.selectedCount} domínio(s) selecionados.` : `Número desativado em ${data.modifiedCount} domínio(s). Outros números ativos foram preservados.`);
      setAction(null); await load();
    } catch (e) { setError(apiError(e)); } finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
    <header><h1 className="text-2xl font-semibold">Troca em vários sites</h1><p className="mt-1 text-sm text-[var(--muted)]">Escolha os domínios e aplique o mesmo número de WhatsApp de uma só vez.</p></header>
    {error && action === null && <p role="alert" className="rounded-xl bg-[var(--danger-bg)] p-3 text-sm text-[var(--danger-text)]">{error}</p>}
    {notice && <p role="status" className="rounded-xl bg-[var(--success-bg)] p-3 text-sm text-[var(--success-text)]">{notice}</p>}
    {loading ? <p role="status">Carregando domínios e números…</p> : <div className="grid gap-6 lg:grid-cols-2">
      <section className="card p-5"><h2 className="text-lg font-semibold">Domínios ativos</h2><p className="mt-1 text-sm text-[var(--muted)]">{selected.length} de {domains.length} selecionados</p>
        <label className="mt-4 block text-sm">Buscar domínio<input className="input mt-1 w-full" type="search" value={domainQuery} onChange={e => setDomainQuery(e.target.value)} /></label>
        <div className="my-3 flex flex-wrap gap-3 text-sm"><button disabled={busy || !filteredDomains.length} className="text-[var(--brand-2)] underline underline-offset-4" onClick={() => setSelected(previous => [...new Set([...previous, ...filteredDomains.map(d => d._id)])])}>Selecionar visíveis</button><button className="text-[var(--muted)] underline underline-offset-4" disabled={busy || !selected.length} onClick={() => setSelected([])}>Limpar seleção</button></div>
        <div className="max-h-[28rem] space-y-1 overflow-y-auto">{filteredDomains.map(d => <label key={d._id} className="flex cursor-pointer items-start gap-3 rounded-lg p-3 hover:bg-[var(--surface-2)]">
          <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand)]" checked={selected.includes(d._id)} onChange={() => toggle(d._id)} disabled={busy} />
          <span className="min-w-0"><span className="block break-all text-sm font-medium">{d.domain}</span><span className="text-xs text-[var(--muted)]">{d.activeNumberId ? `${d.activeNumberId.name} · ${d.activeNumberId.phone}` : "Sem número ativo"}</span></span>
        </label>)}{!filteredDomains.length && <p className="py-5 text-sm text-[var(--muted)]">Nenhum domínio ativo encontrado.</p>}</div>
      </section>
      <section className="card p-5"><h2 className="text-lg font-semibold">Número de WhatsApp</h2><p className="mt-1 text-sm text-[var(--muted)]">Pesquise por telefone ou nome do atendente.</p>
        <label className="mt-4 block text-sm">Buscar número<input className="input mt-1 w-full" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Telefone ou atendente" /></label>
        <div className="mt-3 max-h-80 space-y-1 overflow-y-auto">{filteredNumbers.map(n => <label key={n._id} className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-[var(--surface-2)]">
          <input type="radio" name="bulk-number" className="h-4 w-4 accent-[var(--brand)]" checked={numberId === n._id} onChange={() => setNumberId(n._id)} disabled={busy} />
          <span><span className="block text-sm font-medium">{n.name}</span><span className="text-sm tabular-nums text-[var(--muted)]">{n.phone}</span></span>
        </label>)}{!filteredNumbers.length && <p className="py-5 text-sm text-[var(--muted)]">Nenhum número encontrado.</p>}</div>
        <div className="mt-5 border-t border-[var(--border)] pt-5"><p className="text-sm">{number ? `${number.name} · ${number.phone}` : "Selecione um número para continuar."}</p><p className="mt-1 text-xs text-[var(--muted)]">A ativação substitui o número atual dos sites selecionados. A desativação remove apenas este número.</p>
          <div className="mt-4 flex flex-wrap gap-2"><button disabled={busy || !number || !selected.length} className="btn-primary rounded-xl px-4 py-2.5 text-sm" onClick={() => { setError(""); setAction(true); }}>Ativar nos sites</button><button disabled={busy || !number || !selected.length} className="btn px-4 py-2.5 text-sm" onClick={() => { setError(""); setAction(false); }}>Desativar nos sites</button></div>
        </div>
      </section>
    </div>}
    <Modal open={action !== null} title={action ? "Ativar número nos sites?" : "Desativar número nos sites?"} description={`${number?.name ?? ""} · ${number?.phone ?? ""}. ${selected.length} domínio(s) selecionados.`} confirmText={action ? "Confirmar ativação" : "Confirmar desativação"} busy={busy} onClose={() => { setAction(null); setError(""); }} onConfirm={apply}>
      <ul className="max-h-40 overflow-y-auto text-sm text-[var(--muted)]">{domains.filter(d => selected.includes(d._id)).map(d => <li className="break-all py-1" key={d._id}>{d.domain}</li>)}</ul>
      {error && <p role="alert" className="mt-3 text-sm text-[var(--danger-text)]">{error}</p>}
    </Modal>
  </div>;
}
