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

      if (!data?.ok || !data?.token) throw new Error("Resposta inválida do servidor.");

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
    <div className="app-bg flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card overflow-hidden">
          {/* loading bar */}
          {loading && <div className="progress-bar" />}

          <div className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(180deg, var(--brand), var(--brand-2))",
                  boxShadow: "0 18px 55px rgba(0,145,235,0.22)",
                }}
              />
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
              <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-700">
                {err}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label className="text-sm text-[var(--muted)]">E-mail</label>
                <input
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
                <label className="text-sm text-[var(--muted)]">Senha</label>
                <input
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

        {/* rodapé discreto */}
        <div className="mt-4 text-center text-xs text-[var(--muted)]">
          Futuristic Blue • Secure Admin
        </div>
      </div>
    </div>
  );
}
