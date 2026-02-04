"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextUrl = useMemo(() => {
    const n = searchParams.get("next");
    return n && n.startsWith("/") ? n : "/app";
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });

      if (!data?.ok || !data?.token) {
        throw new Error("Resposta inválida do servidor.");
      }

      setToken(data.token);
      router.replace(nextUrl);
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        "Erro ao entrar. Verifique suas credenciais.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Painel — Troca de Números</h1>
          <p className="text-sm text-white/70">
            Faça login para acessar o dashboard.
          </p>
        </div>

        {err && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-white/80">E-mail</label>
            <input
              className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2 outline-none ring-0 border border-white/10 focus:border-white/30"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@admin.com"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="text-sm text-white/80">Senha</label>
            <input
              className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2 outline-none ring-0 border border-white/10 focus:border-white/30"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-white text-neutral-950 font-medium py-2 hover:bg-white/90 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-4 text-xs text-white/50">
          API: {process.env.NEXT_PUBLIC_API_BASE || "(env não definido)"}
        </div>
      </div>
    </div>
  );
}
