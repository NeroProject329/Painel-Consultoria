"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { clearInstallPrompt, getInstallPrompt, getServerInstallPrompt, subscribeInstallPrompt } from "@/lib/pwa";

export default function PwaControls() {
  const prompt = useSyncExternalStore(subscribeInstallPrompt, getInstallPrompt, getServerInstallPrompt);
  const [installed, setInstalled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const done = () => { setInstalled(true); clearInstallPrompt(); };
    const media = window.matchMedia("(display-mode: standalone)");
    const update = () => setInstalled(media.matches || ("standalone" in navigator && Boolean(navigator.standalone)));
    update(); window.addEventListener("appinstalled", done); media.addEventListener("change", update);
    return () => { window.removeEventListener("appinstalled", done); media.removeEventListener("change", update); };
  }, []);
  async function install() {
    if (!prompt || busy) return; setBusy(true);
    try { await prompt.prompt(); const choice = await prompt.userChoice; clearInstallPrompt();
      setMessage(choice.outcome === "accepted" ? "Instalação solicitada ao navegador." : "Você pode instalar depois pelo menu do navegador.");
    } catch { setMessage("Use o menu do navegador para instalar o painel."); } finally { setBusy(false); }
  }
  if (installed) return <p role="status" className="text-sm text-[var(--success-text)]">O painel está aberto como aplicativo.</p>;
  return <div>{prompt ? <button className="btn-primary rounded-xl px-4 py-2.5 text-sm" disabled={busy} onClick={install}>{busy ? "Abrindo instalação…" : "Instalar painel"}</button> : <p className="text-sm text-[var(--muted)]">No Chrome/Edge, use o menu “Instalar aplicativo”. No Safari do iPhone, toque em Compartilhar e depois em “Adicionar à Tela de Início”.</p>}{message && <p role="status" className="mt-3 text-sm">{message}</p>}</div>;
}
