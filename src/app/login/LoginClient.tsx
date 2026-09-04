"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, apiError } from "@/lib/api";
import { isAuthed, setToken } from "@/lib/auth";
import PanelMark from "@/components/PanelMark";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextUrl = useMemo(() => {
    const n = searchParams.get("next");
    return n && (n === "/app" || n.startsWith("/app/")) ? n : "/app";
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (isAuthed()) router.replace(nextUrl); }, [router, nextUrl]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });

      if (!data?.ok || !data?.token) throw new Error("Resposta inválida do servidor.");

      setToken(data.token);
      router.replace(nextUrl);
    } catch (error: unknown) {
      setErr(apiError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-bg flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card overflow-hidden">
          {loading && <div className="progress-bar" />}

          <div className="p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <PanelMark />
              <div>
                <h1 className="text-lg font-semibold text-[var(--text)]">
                  Painel — Troca de Números
                </h1>
                <p className="text-sm text-[var(--muted)]">
                  Faça login para acessar o dashboard.
                </p>
              </div>
            </div>

            {err && (
              <div role="alert" className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--danger-bg)] p-3 text-sm text-[var(--danger-text)]">
                {err}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label htmlFor="email" className="text-sm text-[var(--muted)]">E-mail</label>
                <input
                  id="email"
                  className="input mt-1 w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@admin.com"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="text-sm text-[var(--muted)]">Senha</label>
                <input
                  id="password"
                  className="input mt-1 w-full"
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
                className="btn-primary w-full px-4 py-2.5 text-sm font-medium disabled:opacity-70"
                style={{ borderRadius: 14 }}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {loading && <span className="spinner" aria-hidden />}
                  {loading ? "Entrando..." : "Entrar"}
                </span>
              </button>
            </form>

            
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-[var(--muted)]">
          Sua sessão permanece conectada por até 30 dias.
        </div>
      </div>
    </div>
  );
}
