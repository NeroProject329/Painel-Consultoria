"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api, apiError } from "@/lib/api";

import type {
  MonitoringListResponse,
  MonitoringStatus,
  SiteMonitorItem,
} from "@/types/monitoring";

const TIMEZONE =
  "America/Sao_Paulo";

function formatDateTime(
  value: string | null
) {
  if (!value) {
    return "Ainda não verificado";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      timeZone: TIMEZONE,

      day: "2-digit",
      month: "2-digit",
      year: "numeric",

      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  ).format(date);
}

function formatElapsed(
  value: string | null,
  now: number
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value).getTime();

  if (
    Number.isNaN(date)
  ) {
    return "—";
  }

  const diff =
    Math.max(
      0,
      now - date
    );

  const seconds =
    Math.floor(
      diff / 1000
    );

  if (seconds < 60) {
    return `há ${seconds}s`;
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

  if (minutes < 60) {
    return `há ${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return (
      `há ${hours}h ` +
      `${minutes % 60}min`
    );
  }

  const days =
    Math.floor(
      hours / 24
    );

  return (
    `há ${days}d ` +
    `${hours % 24}h`
  );
}

function statusLabel(
  status: MonitoringStatus,
  enabled: boolean
) {
  if (!enabled) {
    return "Desativado";
  }

  if (
    status === "online"
  ) {
    return "Online";
  }

  if (
    status === "offline"
  ) {
    return "Offline";
  }

  if (
    status === "unstable"
  ) {
    return "Instável";
  }

  return "Desconhecido";
}

function statusClasses(
  status: MonitoringStatus,
  enabled: boolean
) {
  if (!enabled) {
    return (
      "border-[var(--border)] " +
      "bg-[var(--surface-2)] " +
      "text-[var(--muted)]"
    );
  }

  if (
    status === "online"
  ) {
    return (
      "border-[var(--border)] " +
      "bg-[var(--success-bg)] " +
      "text-[var(--success-text)]"
    );
  }

  if (
    status === "offline"
  ) {
    return (
      "border-[var(--border)] " +
      "bg-[var(--danger-bg)] " +
      "text-[var(--danger-text)]"
    );
  }

  if (
    status === "unstable"
  ) {
    return (
      "border-[var(--border)] " +
      "bg-[var(--warning-bg)] " +
      "text-[var(--warning-text)]"
    );
  }

  return (
    "border-[var(--border)] " +
    "bg-[var(--surface-2)] " +
    "text-[var(--muted)]"
  );
}

function statusDotClasses(
  status: MonitoringStatus,
  enabled: boolean
) {
  if (!enabled) {
    return "bg-neutral-400";
  }

  if (
    status === "online"
  ) {
    return "bg-emerald-500";
  }

  if (
    status === "offline"
  ) {
    return "bg-red-500";
  }

  if (
    status === "unstable"
  ) {
    return "bg-amber-500";
  }

  return "bg-neutral-400";
}

function responseText(
  item: SiteMonitorItem
) {
  if (
    item.lastResponseTimeMs ===
    null
  ) {
    return "—";
  }

  return (
    `${item.lastResponseTimeMs} ms`
  );
}

export default function MonitoringPage() {
  const [
    data,
    setData,
  ] =
    useState<MonitoringListResponse | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    err,
    setErr,
  ] =
    useState<string | null>(
      null
    );

  const [
    lastLoadedAt,
    setLastLoadedAt,
  ] =
    useState<Date | null>(
      null
    );

  const [
    now,
    setNow,
  ] =
    useState(
      () => Date.now()
    );

  const load =
    useCallback(
      async (
        initial = false
      ) => {
        if (initial) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setErr(null);

        try {
          const response =
            await api.get<MonitoringListResponse>(
              "/admin/monitoring"
            );

          setData(
            response.data
          );

          setLastLoadedAt(
            new Date()
          );
        } catch (
          error: unknown
        ) {
          setErr(
            apiError(error, "Erro ao carregar o monitoramento dos sites.")
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  /*
   * Busca inicial +
   * atualização automática.
   */
  useEffect(() => {
    void load(true);

    const refreshTimer =
      window.setInterval(
        () => {
          void load(false);
        },
        30_000
      );

    return () =>
      window.clearInterval(
        refreshTimer
      );
  }, [load]);

  /*
   * Atualiza textos como
   * "há 20s", "há 2min" etc.
   */
  useEffect(() => {
    const clockTimer =
      window.setInterval(
        () => {
          setNow(
            Date.now()
          );
        },
        1_000
      );

    return () =>
      window.clearInterval(
        clockTimer
      );
  }, []);

  const summary =
    data?.summary;

  const items =
  (data?.items ?? []).filter(
    (item) => item.enabled
  );

  const problemCount =
    useMemo(
      () =>
        (summary?.offline ??
          0) +
        (summary?.unstable ??
          0),
      [summary]
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-[var(--text)]">
              Monitoramento
            </h1>

            {problemCount >
            0 ? (
              <span className="rounded-full border border-[var(--border)] bg-[var(--danger-bg)] px-2.5 py-1 text-xs font-medium text-[var(--danger-text)]">
                {problemCount}{" "}
                site(s) precisam
                de atenção
              </span>
            ) : data ? (
              <span className="rounded-full border border-[var(--border)] bg-[var(--success-bg)] px-2.5 py-1 text-xs font-medium text-[var(--success-text)]">
                Tudo operando
                normalmente
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Acompanhe
            disponibilidade,
            resposta HTTP e
            quedas detectadas
            pelo worker.
          </p>

          {lastLoadedAt && (
            <p className="mt-1 text-xs text-[var(--muted)]">
              Última
              atualização:{" "}
              {lastLoadedAt.toLocaleTimeString(
                "pt-BR"
              )}
              . Atualização
              automática a
              cada 30 segundos.
            </p>
          )}
        </div>

        <button
          onClick={() =>
            void load(false)
          }
          disabled={
            refreshing ||
            loading
          }
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing
            ? "Atualizando..."
            : "Atualizar agora"}
        </button>
      </div>

      {err && (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--danger-bg)] p-3 text-sm text-[var(--danger-text)]">
          {err}
        </div>
      )}

      {/* Cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="text-sm text-[var(--muted)]">
            Monitorados
          </div>

          <div className="mt-2 text-3xl font-semibold text-[var(--text)]">
            {summary?.enabled ??
              0}
          </div>

          <div className="mt-1 text-xs text-[var(--muted)]">
            {summary?.disabled ??
              0}{" "}
            desativado(s)
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--success-bg)]/60 p-4">
          <div className="text-sm text-[var(--success-text)]">
            Online
          </div>

          <div className="mt-2 text-3xl font-semibold text-[var(--success-text)]">
            {summary?.online ??
              0}
          </div>

          <div className="mt-1 text-xs text-[var(--success-text)]/80">
            Sites respondendo
            normalmente
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--warning-bg)]/60 p-4">
          <div className="text-sm text-[var(--warning-text)]">
            Instáveis
          </div>

          <div className="mt-2 text-3xl font-semibold text-[var(--warning-text)]">
            {summary?.unstable ??
              0}
          </div>

          <div className="mt-1 text-xs text-[var(--warning-text)]/80">
            Falhas recentes
            ainda não
            confirmadas
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--danger-bg)]/60 p-4">
          <div className="text-sm text-[var(--danger-text)]">
            Offline
          </div>

          <div className="mt-2 text-3xl font-semibold text-[var(--danger-text)]">
            {summary?.offline ??
              0}
          </div>

          <div className="mt-1 text-xs text-[var(--danger-text)]/80">
            Quedas confirmadas
            pelo worker
          </div>
        </div>
      </div>

      {(
        summary?.unknown ??
        0
      ) > 0 && (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)]">
          {summary?.unknown}{" "}
          site(s) ainda estão
          com status
          desconhecido e
          aguardam uma
          verificação válida.
        </div>
      )}

      {/* Lista */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-col gap-1 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-base font-semibold text-[var(--text)]">
              Sites
            </div>

            <p className="text-sm text-[var(--muted)]">
              Problemas aparecem
              primeiro. Clique em
              um site para abrir
              o histórico.
            </p>
          </div>

        <div className="text-xs text-[var(--muted)]">
            {summary?.enabled ?? 0}{" "}
            monitorado(s)
        </div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-[var(--muted)]">
            Carregando
            monitoramento…
          </div>
        ) : items.length ===
          0 ? (
          <div className="p-8 text-center">
            <div className="text-sm font-medium text-[var(--text)]">
              Nenhum site
              monitorado ainda
            </div>

            <p className="mt-1 text-sm text-[var(--muted)]">
              O worker criará os
              registros
              automaticamente a
              partir dos domínios
              cadastrados.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {items.map(
              (item) => (
                <Link
                  key={
                    item.id
                  }
                  href={`/app/monitoring/${item.id}`}
                  className="block p-4 transition hover:bg-[var(--surface-2)]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${statusDotClasses(
                            item.displayStatus,
                            item.enabled
                          )}`}
                        />

                        <div className="truncate text-base font-semibold text-[var(--text)]">
                          {
                            item.domain
                          }
                        </div>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses(
                            item.displayStatus,
                            item.enabled
                          )}`}
                        >
                          {statusLabel(
                            item.displayStatus,
                            item.enabled
                          )}
                        </span>
                      </div>

                      <div className="mt-1 truncate text-xs text-[var(--muted)]">
                        {
                          item.url
                        }
                      </div>

                      {item.displayStatus ===
                        "offline" &&
                        item.offlineSince && (
                          <div className="mt-2 text-sm font-medium text-[var(--danger-text)]">
                            Fora do ar{" "}
                            {formatElapsed(
                              item.offlineSince,
                              now
                            )}
                          </div>
                        )}

                      {item.displayStatus ===
                        "unstable" && (
                        <div className="mt-2 text-sm font-medium text-[var(--warning-text)]">
                          {
                            item.consecutiveFailures
                          }{" "}
                          falha(s)
                          consecutiva(s).
                          Aguardando
                          confirmação
                          da queda.
                        </div>
                      )}

                      {item.lastError &&
                        item.displayStatus !==
                          "online" && (
                          <div className="mt-1 text-xs text-[var(--muted)]">
                            Último
                            erro:{" "}
                            {
                              item.lastError
                            }
                          </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                        <div className="text-xs text-[var(--muted)]">
                          HTTP
                        </div>

                        <div className="mt-1 text-sm font-semibold text-[var(--text)]">
                          {item.lastHttpStatus ??
                            "—"}
                        </div>
                      </div>

                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                        <div className="text-xs text-[var(--muted)]">
                          Resposta
                        </div>

                        <div className="mt-1 text-sm font-semibold text-[var(--text)]">
                          {responseText(
                            item
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                        <div className="text-xs text-[var(--muted)]">
                          Falhas
                        </div>

                        <div className="mt-1 text-sm font-semibold text-[var(--text)]">
                          {
                            item.consecutiveFailures
                          }
                        </div>
                      </div>

                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                        <div className="text-xs text-[var(--muted)]">
                          Verificação
                        </div>

                        <div
                          className="mt-1 text-sm font-semibold text-[var(--text)]"
                          title={formatDateTime(
                            item.lastCheckedAt
                          )}
                        >
                          {formatElapsed(
                            item.lastCheckedAt,
                            now
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
