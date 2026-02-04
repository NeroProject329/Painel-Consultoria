"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Switch from "@/components/ui/Switch";
import type { NumberItem } from "@/types/number";
import type { DomainDetail, DomainNumberDetail } from "@/types/domainDetail";

export default function DomainDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const domainId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [detail, setDetail] = useState<DomainDetail | null>(null);

  // números do sistema (para vincular)
  const [allNumbers, setAllNumbers] = useState<NumberItem[]>([]);
  const [selectedNumberId, setSelectedNumberId] = useState<string>("");

  // modal confirmação ativação
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmNumber, setConfirmNumber] = useState<DomainNumberDetail | null>(null);

  // modal editar número
  const [editOpen, setEditOpen] = useState(false);
  const [editNumber, setEditNumber] = useState<DomainNumberDetail | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [linkAllOpen, setLinkAllOpen] = useState(false);


  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const [dRes, nRes] = await Promise.all([
        api.get(`/admin/domains/${domainId}`),
        api.get("/admin/numbers"),
      ]);

      setDetail(dRes.data?.item ?? null);
      setAllNumbers(nRes.data?.items ?? []);
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Erro ao carregar domínio.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainId]);

  const linkedIds = useMemo(() => {
    const ids = new Set<string>();
    detail?.numbers?.forEach((n) => ids.add(n.id));
    return ids;
  }, [detail]);

  const availableToLink = useMemo(() => {
    return allNumbers.filter((n) => !linkedIds.has(n._id));
  }, [allNumbers, linkedIds]);

  function prettyActiveInOther(n: DomainNumberDetail) {
    const others = n.activeInDomains.filter((x) => x.id !== detail?.id);
    if (others.length === 0) return null;
    if (others.length === 1) return others[0].domain;
    return `${others[0].domain} (+${others.length - 1})`;
  }

  async function toggleDomainActive(nextValue: boolean) {
    if (!detail) return;
    setSaving(true);
    setErr(null);
    try {
      const { data } = await api.patch(`/admin/domains/${detail.id}`, { isActive: nextValue });
      setDetail((prev) => prev ? { ...prev, isActive: data.item.isActive } : prev);
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Erro ao atualizar status do domínio.");
    } finally {
      setSaving(false);
    }
  }

  async function linkNumber() {
    if (!detail) return;
    if (!selectedNumberId) return;

    setSaving(true);
    setErr(null);
    try {
      await api.post(`/admin/domains/${detail.id}/numbers`, { numberId: selectedNumberId });
      setSelectedNumberId("");
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Erro ao vincular número.");
    } finally {
      setSaving(false);
    }
  }

async function linkAllNumbers() {
  if (!detail) return;

  const ids = availableToLink.map((n) => n._id);
  if (ids.length === 0) return;

  setSaving(true);
  setErr(null);

  const failed: string[] = [];

  // sequencial (evita estourar request)
  for (const id of ids) {
    try {
      await api.post(`/admin/domains/${detail.id}/numbers`, { numberId: id });
    } catch {
      failed.push(id);
    }
  }

  await load();

  if (failed.length) {
    setErr(`Falha ao vincular ${failed.length} número(s). Tente novamente.`);
  }

  setSaving(false);
}


  async function unlinkNumber(numberId: string) {
    if (!detail) return;
    setSaving(true);
    setErr(null);
    try {
      await api.delete(`/admin/domains/${detail.id}/numbers/${numberId}`);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Erro ao desvincular número.");
    } finally {
      setSaving(false);
    }
  }

  function requestActivate(n: DomainNumberDetail) {
    if (!detail) return;

    const others = n.activeInDomains.filter((x) => x.id !== detail.id);
    if (others.length > 0) {
      setConfirmNumber(n);
      setConfirmOpen(true);
      return;
    }

    // sem conflito → ativa direto
    activateNumber(n.id);
  }

  async function activateNumber(numberId: string) {
    if (!detail) return;

    setSaving(true);
    setErr(null);
    try {
      await api.patch(`/admin/domains/${detail.id}/active-number`, { numberId });
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Erro ao ativar número.");
    } finally {
      setSaving(false);
    }
  }

  async function deactivateActiveNumber() {
    if (!detail) return;

    setSaving(true);
    setErr(null);
    try {
      await api.patch(`/admin/domains/${detail.id}/active-number`, { numberId: null });
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Erro ao desativar número ativo.");
    } finally {
      setSaving(false);
    }
  }

  function openEdit(n: DomainNumberDetail) {
    setEditNumber(n);
    setEditName(n.name);
    setEditPhone(n.phone);
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!editNumber) return;
    setSaving(true);
    setErr(null);
    try {
      await api.patch(`/admin/numbers/${editNumber.id}`, {
        name: editName,
        phone: editPhone,
      });
      setEditOpen(false);
      setEditNumber(null);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Erro ao editar número.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="text-sm text-neutral-600">Carregando…</div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Não foi possível carregar o domínio.
        </div>
        <button
          onClick={() => router.push("/app/domains")}
          className="mt-4 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <button
            onClick={() => router.push("/app/domains")}
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            ← Voltar para Domínios
          </button>

          <h1 className="mt-2 text-xl font-semibold text-neutral-900">
            {detail.domain}
          </h1>
          <p className="text-sm text-neutral-600">
            Gerencie números vinculados e ativação
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={saving}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
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

      {/* Status do domínio */}
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-neutral-500">Status do domínio</div>
            <div className="text-base font-semibold text-neutral-900">
              {detail.isActive ? "Ativo" : "Inativo"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-neutral-600">Ativar</div>
            <Switch checked={detail.isActive} onChange={toggleDomainActive} disabled={saving} />
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <div className="text-xs text-neutral-500">Número ativo deste domínio</div>
          {detail.activeNumberId ? (
            <div className="mt-1 flex items-center justify-between gap-3">
              <div className="text-sm text-neutral-900">
                Ativo ID: <span className="font-medium">{detail.activeNumberId}</span>
              </div>
              <button
                onClick={deactivateActiveNumber}
                disabled={saving}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
              >
                Desativar
              </button>
            </div>
          ) : (
            <div className="mt-1 text-sm text-neutral-600">Sem número ativo</div>
          )}
        </div>
      </div>

      {/* Vincular número */}
      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="text-base font-semibold text-neutral-900">Vincular número</div>
        <p className="text-sm text-neutral-600">
          Selecione um número já cadastrado para vincular a este domínio.
        </p>

        <div className="mt-3 flex flex-col gap-2 md:flex-row">
          <select
            value={selectedNumberId}
            onChange={(e) => setSelectedNumberId(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
          >
            <option value="">Selecione um número…</option>
            {availableToLink.map((n) => (
              <option key={n._id} value={n._id}>
                {n.phone} — {n.name}
              </option>
            ))}
          </select>

          <button
            onClick={linkNumber}
            disabled={saving || !selectedNumberId}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
            >
             Vincular
          </button>

          <button
            onClick={() => setLinkAllOpen(true)}

            disabled={saving || availableToLink.length === 0}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
          >
            Vincular todos ({availableToLink.length})
          </button>

        </div>

        {availableToLink.length === 0 && (
          <div className="mt-2 text-xs text-neutral-500">
            Nenhum número disponível para vincular (todos já estão vinculados).
          </div>
        )}
      </div>

      {/* Lista números vinculados */}
      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-neutral-900">
              Números deste domínio
            </div>
            <div className="text-sm text-neutral-600">
              {detail.numbers.length} vinculados
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {detail.numbers.map((n) => {
            const otherActive = prettyActiveInOther(n);

            return (
              <div
                key={n.id}
                className="rounded-2xl border border-neutral-200 bg-white p-3"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">
                      {n.phone}
                    </div>
                    <div className="text-xs text-neutral-600">
                      Atendente: {n.name}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {n.isActiveHere && (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                          Ativo aqui
                        </span>
                      )}
                      {otherActive && (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800">
                          Ativo em: {otherActive}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => requestActivate(n)}
                      disabled={saving || !detail.isActive || n.isActiveHere}
                      className="rounded-xl bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-60"
                      title={!detail.isActive ? "Domínio inativo" : ""}
                    >
                      {n.isActiveHere ? "Ativo" : "Ativar"}
                    </button>

                    <button
                      onClick={() => openEdit(n)}
                      disabled={saving}
                      className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => unlinkNumber(n.id)}
                      disabled={saving}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100 disabled:opacity-60"
                    >
                      Desvincular
                    </button>
                  </div>
                </div>
              </div>

              
            );
          })}

          {detail.numbers.length === 0 && (
            <div className="text-sm text-neutral-600">
              Nenhum número vinculado ainda.
            </div>
          )}
        </div>
      </div>

      {/* Modal confirmação ativação */}
      <Modal
        open={confirmOpen}
        title="Confirmar ativação"
        description={
          confirmNumber
            ? `Esse número já está ativo em outro domínio. Deseja ativar também aqui?`
            : ""
        }
        confirmText="Ativar mesmo assim"
        cancelText="Cancelar"
        onClose={() => {
          setConfirmOpen(false);
          setConfirmNumber(null);
        }}
        onConfirm={() => {
          if (confirmNumber) activateNumber(confirmNumber.id);
          setConfirmOpen(false);
          setConfirmNumber(null);
        }}
      />

      {/* Modal editar */}
      <Modal
        open={editOpen}
        title="Editar número"
        description="Altere o nome do atendente e/ou o telefone."
        confirmText="Salvar"
        cancelText="Cancelar"
        onClose={() => {
          setEditOpen(false);
          setEditNumber(null);
        }}
        onConfirm={saveEdit}
      />

      <Modal
  open={linkAllOpen}
  title="Vincular todos os números?"
  description={
    detail
      ? `Você está prestes a vincular ${availableToLink.length} número(s) ao domínio ${detail.domain}. Deseja continuar?`
      : `Deseja continuar?`
  }
  confirmText={`Vincular ${availableToLink.length}`}
  cancelText="Cancelar"
  onClose={() => setLinkAllOpen(false)}
  onConfirm={async () => {
    setLinkAllOpen(false);
    await linkAllNumbers();
  }}
/>


      {editOpen && (
        <div className="fixed inset-0 z-[60] pointer-events-none">
          {/* overlay do modal já existe, então só renderizamos inputs em uma “camada” segura */}
        </div>
      )}

      {/* Inputs do editar: renderizados logo abaixo para ficar simples */}
      {editOpen && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center px-4 pointer-events-none">
          <div className="w-full max-w-md pointer-events-auto rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
            <div className="text-sm font-semibold text-neutral-900">Dados do número</div>

            <div className="mt-3 space-y-2">
              <div>
                <label className="text-xs text-neutral-600">Atendente</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
                  placeholder="Nome do atendente"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-600">Telefone</label>
                <input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
                  placeholder="Só números ou com máscara"
                />
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditOpen(false);
                    setEditNumber(null);
                  }}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving || !editName.trim() || !editPhone.trim()}
                  className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
