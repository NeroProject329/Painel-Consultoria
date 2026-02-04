"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { NumberItem } from "@/types/number";

type DomainLite = {
  _id: string;
  domain: string;
  isActive: boolean;
  activeNumberId?: string | null;
  numbers?: string[];
};

function summarizeDomains(domains: string[]) {
  if (domains.length === 0) return null;
  if (domains.length === 1) return domains[0];
  return `${domains[0]} (+${domains.length - 1})`;
}

export default function NumbersPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [domains, setDomains] = useState<DomainLite[]>([]);

  // criar
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  // editar modal
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<NumberItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<NumberItem | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const [nRes, dRes] = await Promise.all([
        api.get("/admin/numbers"),
        api.get("/admin/domains"),
      ]);

      setNumbers(nRes.data?.items ?? []);
      setDomains(dRes.data?.items ?? []);
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Erro ao carregar números.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Mapas: numberId -> [domínios]
  const { activeMap, linkedMap } = useMemo(() => {
    const active = new Map<string, string[]>();
    const linked = new Map<string, string[]>();

    for (const d of domains) {
      const activeId = d.activeNumberId ? String(d.activeNumberId) : null;
      if (activeId) {
        const arr = active.get(activeId) ?? [];
        arr.push(d.domain);
        active.set(activeId, arr);
      }

      const list = d.numbers ?? [];
      for (const nId of list) {
        const id = String(nId);
        const arr = linked.get(id) ?? [];
        arr.push(d.domain);
        linked.set(id, arr);
      }
    }

    return { activeMap: active, linkedMap: linked };
  }, [domains]);

  function openEdit(n: NumberItem) {
    setEditItem(n);
    setEditName(n.name);
    setEditPhone(n.phone);
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!editItem) return;
    setSaving(true);
    setErr(null);
    try {
      await api.patch(`/admin/numbers/${editItem._id}`, {
        name: editName,
        phone: editPhone,
      });
      setEditOpen(false);
      setEditItem(null);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Erro ao editar número.");
    } finally {
      setSaving(false);
    }
  }

  function requestDelete(n: NumberItem) {
    setDeleteItem(n);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!deleteItem) return;
    setSaving(true);
    setErr(null);
    try {
      await api.delete(`/admin/numbers/${deleteItem._id}`);
      setDeleteOpen(false);
      setDeleteItem(null);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Erro ao deletar número.");
    } finally {
      setSaving(false);
    }
  }

  async function createNumber() {
    const name = newName.trim();
    const phone = newPhone.trim();
    if (!name || !phone) return;

    setSaving(true);
    setErr(null);
    try {
      await api.post("/admin/numbers", { name, phone });
      setNewName("");
      setNewPhone("");
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Erro ao cadastrar número.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link
        href="/app"
        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
      >
        <span aria-hidden>←</span> Voltar
      </Link>

      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Números</h1>
          <p className="text-sm text-neutral-600">
            {numbers.length} cadastrados • status calculado via domínios
          </p>
        </div>

        <button
          onClick={load}
          disabled={saving}
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
        >
          Recarregar
        </button>
      </div>

      {err && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Cadastro */}
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="text-base font-semibold text-neutral-900">
          Cadastrar novo número
        </div>
        <p className="text-sm text-neutral-600">
          Pode digitar com máscara ou só números (a API normaliza).
        </p>

        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <input
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="Telefone (ex: 11999999999)"
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
          />
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome do atendente"
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
          />
          <button
            onClick={createNumber}
            disabled={saving || !newPhone.trim() || !newName.trim()}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Cadastrar"}
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="text-base font-semibold text-neutral-900">
          Lista de números
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-neutral-600">Carregando…</div>
        ) : (
          <div className="mt-4 space-y-2">
            {numbers.map((n) => {
              const activeIn = activeMap.get(n._id) ?? [];
              const linkedIn = linkedMap.get(n._id) ?? [];

              const activeLabel = summarizeDomains(activeIn);
              const linkedLabel = summarizeDomains(linkedIn);

              const canDelete = activeIn.length === 0 && linkedIn.length === 0;

              return (
                <div
                  key={n._id}
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
                        {activeLabel && (
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                            Ativo em: {activeLabel}
                          </span>
                        )}
                        {linkedLabel && (
                          <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-xs text-sky-700">
                            Vinculado em: {linkedLabel}
                          </span>
                        )}
                        {!activeLabel && !linkedLabel && (
                          <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-neutral-600">
                            Livre
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openEdit(n)}
                        disabled={saving}
                        className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => requestDelete(n)}
                        disabled={saving || !canDelete}
                        title={
                          canDelete
                            ? ""
                            : "Para deletar, desvincule dos domínios e remova como ativo primeiro."
                        }
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100 disabled:opacity-60"
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {numbers.length === 0 && (
              <div className="text-sm text-neutral-600">
                Nenhum número cadastrado ainda.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Editar */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setEditOpen(false);
              setEditItem(null);
            }}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
            <div className="text-base font-semibold text-neutral-900">
              Editar número
            </div>

            <div className="mt-3 space-y-2">
              <div>
                <label className="text-xs text-neutral-600">Telefone</label>
                <input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-600">Atendente</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
                />
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditOpen(false);
                    setEditItem(null);
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

      {/* Modal Deletar */}
      {deleteOpen && deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setDeleteOpen(false);
              setDeleteItem(null);
            }}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
            <div className="text-base font-semibold text-neutral-900">
              Confirmar exclusão
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              Tem certeza que deseja deletar o número{" "}
              <span className="font-medium text-neutral-900">
                {deleteItem.phone}
              </span>
              ?
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setDeleteOpen(false);
                  setDeleteItem(null);
                }}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={saving}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60"
              >
                {saving ? "Deletando..." : "Deletar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
