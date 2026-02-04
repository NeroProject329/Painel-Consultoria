import Link from "next/link";

export default function HomePage() {
  return (
    <div className="app-bg flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md p-6 text-center">
        <div
          className="mx-auto mb-4 h-12 w-12 rounded-2xl"
          style={{
            background: "linear-gradient(180deg, var(--brand), var(--brand-2))",
            boxShadow: "0 18px 55px rgba(0,145,235,0.22)",
          }}
        />
        <h1 className="text-lg font-semibold text-[var(--text)]">
          Painel — Troca de Números
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Acesse o painel para gerenciar domínios e números.
        </p>

        <Link
          href="/login"
          className="btn-primary mt-5 inline-flex w-full items-center justify-center px-4 py-2.5 text-sm font-medium"
          style={{ borderRadius: 14 }}
        >
          Entrar
        </Link>
      </div>
    </div>
  );
}
