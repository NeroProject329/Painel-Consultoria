"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "@/lib/api";

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
      "border-neutral-200 " +
      "bg-neutral-50 " +
      "text-neutral-600"
    );
  }

  if (
    status === "online"
  ) {
    return (
      "border-emerald-200 " +
      "bg-emerald-50 " +
      "text-emerald-700"
    );
  }

  if (
    status === "offline"
  ) {
    return (
      "border-red-200 " +
      "bg-red-50 " +
      "text-red-700"
    );
  }

  if (
    status === "unstable"
  ) {
    return (
      "border-amber-200 " +
      "bg-amber-50 " +
      "text-amber-700"
    );
  }

  return (
    "border-neutral-200 " +
    "bg-neutral-50 " +
    "text-neutral-600"
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
          error: any
        ) {
          setErr(
            error?.response
              ?.data?.error ||
              "Erro ao carregar o monitoramento dos sites."
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
    data?.items ?? [];

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
            <h1 className="text-xl font-semibold text-neutral-900">
              Monitoramento
            </h1>

            {problemCount >
            0 ? (
              <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                {problemCount}{" "}
                site(s) precisam
                de atenção
              </span>
            ) : data ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                Tudo operando
                normalmente
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-neutral-600">
            Acompanhe
            disponibilidade,
            resposta HTTP e
            quedas detectadas
            pelo worker.
          </p>

          {lastLoadedAt && (
            <p className="mt-1 text-xs text-neutral-500">
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
          className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing
            ? "Atualizando..."
            : "Atualizar agora"}
        </button>
      </div>

      {err && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="text-sm text-neutral-500">
            Monitorados
          </div>

          <div className="mt-2 text-3xl font-semibold text-neutral-900">
            {summary?.enabled ??
              0}
          </div>

          <div className="mt-1 text-xs text-neutral-500">
            {summary?.disabled ??
              0}{" "}
            desativado(s)
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="text-sm text-emerald-700">
            Online
          </div>

          <div className="mt-2 text-3xl font-semibold text-emerald-950">
            {summary?.online ??
              0}
          </div>

          <div className="mt-1 text-xs text-emerald-700/80">
            Sites respondendo
            normalmente
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="text-sm text-amber-700">
            Instáveis
          </div>

          <div className="mt-2 text-3xl font-semibold text-amber-950">
            {summary?.unstable ??
              0}
          </div>

          <div className="mt-1 text-xs text-amber-700/80">
            Falhas recentes
            ainda não
            confirmadas
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4">
          <div className="text-sm text-red-700">
            Offline
          </div>

          <div className="mt-2 text-3xl font-semibold text-red-950">
            {summary?.offline ??
              0}
          </div>

          <div className="mt-1 text-xs text-red-700/80">
            Quedas confirmadas
            pelo worker
          </div>
        </div>
      </div>

      {(
        summary?.unknown ??
        0
      ) > 0 && (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          {summary?.unknown}{" "}
          site(s) ainda estão
          com status
          desconhecido e
          aguardam uma
          verificação válida.
        </div>
      )}

      {/* Lista */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="flex flex-col gap-1 border-b border-neutral-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-base font-semibold text-neutral-900">
              Sites
            </div>

            <p className="text-sm text-neutral-600">
              Problemas aparecem
              primeiro. Clique em
              um site para abrir
              o histórico.
            </p>
          </div>

          <div className="text-xs text-neutral-500">
            {summary?.total ??
              0}{" "}
            cadastrado(s)
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-neutral-600">
            Carregando
            monitoramento…
          </div>
        ) : items.length ===
          0 ? (
          <div className="p-8 text-center">
            <div className="text-sm font-medium text-neutral-900">
              Nenhum site
              monitorado ainda
            </div>

            <p className="mt-1 text-sm text-neutral-600">
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
                  className="block p-4 transition hover:bg-neutral-50"
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

                        <div className="truncate text-base font-semibold text-neutral-900">
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

                      <div className="mt-1 truncate text-xs text-neutral-500">
                        {
                          item.url
                        }
                      </div>

                      {item.displayStatus ===
                        "offline" &&
                        item.offlineSince && (
                          <div className="mt-2 text-sm font-medium text-red-700">
                            Fora do ar{" "}
                            {formatElapsed(
                              item.offlineSince,
                              now
                            )}
                          </div>
                        )}

                      {item.displayStatus ===
                        "unstable" && (
                        <div className="mt-2 text-sm font-medium text-amber-700">
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
                          <div className="mt-1 text-xs text-neutral-600">
                            Último
                            erro:{" "}
                            {
                              item.lastError
                            }
                          </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <div className="text-xs text-neutral-500">
                          HTTP
                        </div>

                        <div className="mt-1 text-sm font-semibold text-neutral-900">
                          {item.lastHttpStatus ??
                            "—"}
                        </div>
                      </div>

                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <div className="text-xs text-neutral-500">
                          Resposta
                        </div>

                        <div className="mt-1 text-sm font-semibold text-neutral-900">
                          {responseText(
                            item
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <div className="text-xs text-neutral-500">
                          Falhas
                        </div>

                        <div className="mt-1 text-sm font-semibold text-neutral-900">
                          {
                            item.consecutiveFailures
                          }
                        </div>
                      </div>

                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <div className="text-xs text-neutral-500">
                          Verificação
                        </div>

                        <div
                          className="mt-1 text-sm font-semibold text-neutral-900"
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