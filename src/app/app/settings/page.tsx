"use client";
import { useState } from "react";
import { api, apiError } from "@/lib/api";
import { setToken } from "@/lib/auth";
import PwaControls from "@/components/PwaControls";

export default function SettingsPage() {
  const [current, setCurrent] = useState(""); const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState(""); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (busy) return; setError(""); setNotice("");
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    setBusy(true);
    try { const { data } = await api.patch("/auth/password", { currentPassword: current, newPassword: password });
      setToken(data.token); setCurrent(""); setPassword(""); setConfirm("");
      setNotice("Senha alterada. Você continua conectado; as outras sessões foram encerradas.");
    } catch (e) { setError(apiError(e)); } finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-6xl space-y-6 px-4 py-6"><header><h1 className="text-2xl font-semibold">Configurações</h1><p className="mt-1 text-sm text-[var(--muted)]">Sua conta e o aplicativo no seu dispositivo.</p></header>
    <div className="grid items-start gap-6 lg:grid-cols-2"><section className="card p-5"><h2 className="text-lg font-semibold">Alterar senha</h2><p className="mt-1 text-sm text-[var(--muted)]">Sua senha fica salva no painel, inclusive após reiniciar o servidor.</p>
      <form onSubmit={submit} className="mt-5 space-y-4"><label className="block text-sm">Senha atual<input className="input mt-1 w-full" type="password" autoComplete="current-password" required value={current} onChange={e => setCurrent(e.target.value)} /></label>
        <label className="block text-sm">Nova senha<input className="input mt-1 w-full" type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={password} onChange={e => setPassword(e.target.value)} /><span className="mt-1 block text-xs text-[var(--muted)]">Use de 8 a 72 caracteres.</span></label>
        <label className="block text-sm">Confirmar nova senha<input className="input mt-1 w-full" type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} /></label>
        {error && <p role="alert" className="text-sm text-[var(--danger-text)]">{error}</p>}{notice && <p role="status" className="text-sm text-[var(--success-text)]">{notice}</p>}
        <button className="btn-primary rounded-xl px-5 py-2.5 text-sm" disabled={busy}>{busy ? "Alterando…" : "Salvar nova senha"}</button></form>
    </section><div className="space-y-6"><section className="card p-5"><h2 className="text-lg font-semibold">Instalar aplicativo</h2><p className="mt-1 mb-4 text-sm text-[var(--muted)]">Abra o painel direto da tela inicial, sem a barra do navegador.</p><PwaControls /></section>
      <section className="card p-5"><h2 className="text-lg font-semibold">Sessão de 30 dias</h2><p className="mt-2 text-sm text-[var(--muted)]">A duração passa a valer ao entrar novamente. Limpar os dados do navegador, sair da conta ou alterar a senha em outro dispositivo encerra a sessão.</p><p className="mt-2 text-sm text-[var(--muted)]">As alterações de números e domínios precisam de internet.</p></section></div></div>
  </div>;
}
