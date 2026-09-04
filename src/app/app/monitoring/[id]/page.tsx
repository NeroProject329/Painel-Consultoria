"use client";

import Link from "next/link";

import {
  useParams,
} from "next/navigation";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { api, apiError } from "@/lib/api";

import type {
  MonitoringDetailResponse,
  MonitoringIncidentsResponse,
  MonitoringStatus,
  SiteIncidentItem,
} from "@/types/monitoring";

const TIMEZONE =
  "America/Sao_Paulo";

function formatDateTime(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
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

function formatDuration(
  durationMs: number | null,
  startedAt?: string,
  now?: number
) {
  let value =
    durationMs;

  /*
   * Incidente ainda aberto.
   */
  if (
    value === null &&
    startedAt &&
    now
  ) {
    const start =
      new Date(
        startedAt
      ).getTime();

    if (
      !Number.isNaN(start)
    ) {
      value =
        Math.max(
          0,
          now - start
        );
    }
  }

  if (
    value === null
  ) {
    return "—";
  }

  const totalSeconds =
    Math.max(
      0,
      Math.floor(
        value / 1000
      )
    );

  const minutes =
    Math.floor(
      totalSeconds / 60
    );

  const hours =
    Math.floor(
      minutes / 60
    );

  const days =
    Math.floor(
      hours / 24
    );

  if (days > 0) {
    return (
      `${days}d ` +
      `${hours % 24}h ` +
      `${minutes % 60}min`
    );
  }

  if (hours > 0) {
    return (
      `${hours}h ` +
      `${minutes % 60}min`
    );
  }

  if (minutes > 0) {
    return (
      `${minutes}min ` +
      `${totalSeconds % 60}s`
    );
  }

  return `${totalSeconds}s`;
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

function IncidentCard({
  item,
  now,
}: {
  item: SiteIncidentItem;
  now: number;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="w-full">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "rounded-full border px-2.5 py-1 text-xs font-medium",

                item.isOpen
                  ? "border-[var(--border)] bg-[var(--danger-bg)] text-[var(--danger-text)]"
                  : "border-[var(--border)] bg-[var(--success-bg)] text-[var(--success-text)]",
              ].join(" ")}
            >
              {item.isOpen
                ? "Em andamento"
                : "Recuperado"}
            </span>

            <span className="text-sm font-semibold text-[var(--text)]">
              {item.isOpen
                ? "Site offline"
                : "Incidente encerrado"}
            </span>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-xs text-[var(--muted)]">
                Início
              </div>

              <div className="mt-1 text-sm font-medium text-[var(--text)]">
                {formatDateTime(
                  item.startedAt
                )}
              </div>
            </div>

            <div>
              <div className="text-xs text-[var(--muted)]">
                Fim
              </div>

              <div className="mt-1 text-sm font-medium text-[var(--text)]">
                {item.endedAt
                  ? formatDateTime(
                      item.endedAt
                    )
                  : "Ainda offline"}
              </div>
            </div>

            <div>
              <div className="text-xs text-[var(--muted)]">
                Duração
              </div>

              <div className="mt-1 text-sm font-medium text-[var(--text)]">
                {formatDuration(
                  item.durationMs,
                  item.startedAt,
                  now
                )}
              </div>
            </div>

            <div>
              <div className="text-xs text-[var(--muted)]">
                HTTP na queda
              </div>

              <div className="mt-1 text-sm font-medium text-[var(--text)]">
                {item.httpStatus ??
                  "Sem resposta"}
              </div>
            </div>
          </div>

          {item.reason && (
            <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text)]">
              Motivo:{" "}
              {item.reason}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MonitoringDetailPage() {
  const params =
    useParams();

  const rawId =
    params?.id;

  const id =
    Array.isArray(rawId)
      ? rawId[0]
      : rawId;

  const [
    detail,
    setDetail,
  ] =
    useState<MonitoringDetailResponse | null>(
      null
    );

  const [
    incidents,
    setIncidents,
  ] =
    useState<MonitoringIncidentsResponse | null>(
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
        if (!id) {
          return;
        }

        if (initial) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setErr(null);

        try {
          const [
            detailResponse,
            incidentsResponse,
          ] =
            await Promise.all([
              api.get<MonitoringDetailResponse>(
                `/admin/monitoring/${id}`
              ),

              api.get<MonitoringIncidentsResponse>(
                `/admin/monitoring/${id}/incidents`,
                {
                  params: {
                    limit: 100,
                  },
                }
              ),
            ]);

          setDetail(
            detailResponse.data
          );

          setIncidents(
            incidentsResponse.data
          );
        } catch (
          error: unknown
        ) {
          setErr(
            apiError(error, "Erro ao carregar os detalhes do monitoramento.")
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [id]
    );

  /*
   * Atualização automática.
   */
  useEffect(() => {
    if (!id) {
      return;
    }

    void load(true);

    const timer =
      window.setInterval(
        () => {
          void load(false);
        },
        30_000
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [id, load]);

  /*
   * Atualiza duração
   * de incidentes abertos.
   */
  useEffect(() => {
    const timer =
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
        timer
      );
  }, []);

  const item =
    detail?.item;

  if (
    loading &&
    !item
  ) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Link
          href="/app/monitoring"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"
        >
          <span aria-hidden>
            ←
          </span>

          Voltar
        </Link>

        <div className="mt-6 text-sm text-[var(--muted)]">
          Carregando
          detalhes…
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            href="/app/monitoring"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"
          >
            <span aria-hidden>
              ←
            </span>

            Voltar para
            monitoramento
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-[var(--text)]">
              {item?.domain ??
                "Monitoramento"}
            </h1>

            {item && (
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
            )}
          </div>

          {item && (
            <p className="mt-1 text-sm text-[var(--muted)]">
              {item.url}
            </p>
          )}
        </div>

        <button
          onClick={() =>
            void load(false)
          }
          disabled={
            refreshing
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

      {item && (
        <>
          {/* Alertas */}

          {item.displayStatus ===
            "offline" &&
            item.offlineSince && (
              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--danger-bg)] p-4">
                <div className="text-sm font-semibold text-[var(--danger-text)]">
                  Este site está
                  fora do ar
                </div>

                <div className="mt-1 text-sm text-[var(--danger-text)]">
                  Queda confirmada
                  há{" "}
                  {formatDuration(
                    null,
                    item.offlineSince,
                    now
                  )}
                  .

                  {item.lastError
                    ? ` Último erro: ${item.lastError}`
                    : ""}
                </div>
              </div>
            )}

          {item.displayStatus ===
            "unstable" && (
            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--warning-bg)] p-4">
              <div className="text-sm font-semibold text-[var(--warning-text)]">
                O site está
                apresentando
                instabilidade
              </div>

              <div className="mt-1 text-sm text-[var(--warning-text)]">
                {
                  item.consecutiveFailures
                }{" "}
                falha(s)
                consecutiva(s)
                detectada(s). O
                worker ainda está
                confirmando se
                houve uma queda.
              </div>
            </div>
          )}

          {/* Cards */}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="text-sm text-[var(--muted)]">
                HTTP atual
              </div>

              <div className="mt-2 text-2xl font-semibold text-[var(--text)]">
                {item.lastHttpStatus ??
                  "—"}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="text-sm text-[var(--muted)]">
                Tempo de resposta
              </div>

              <div className="mt-2 text-2xl font-semibold text-[var(--text)]">
                {item.lastResponseTimeMs !==
                null
                  ? `${item.lastResponseTimeMs} ms`
                  : "—"}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="text-sm text-[var(--muted)]">
                Falhas
                consecutivas
              </div>

              <div className="mt-2 text-2xl font-semibold text-[var(--text)]">
                {
                  item.consecutiveFailures
                }
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="text-sm text-[var(--muted)]">
                Incidentes
                registrados
              </div>

              <div className="mt-2 text-2xl font-semibold text-[var(--text)]">
                {
                  item.incidentCount
                }
              </div>
            </div>
          </div>

          {/* Informações */}

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="text-base font-semibold text-[var(--text)]">
                Últimas
                verificações
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-3">
                  <span className="text-[var(--muted)]">
                    Última
                    verificação
                  </span>

                  <span className="text-right font-medium text-[var(--text)]">
                    {formatDateTime(
                      item.lastCheckedAt
                    )}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-3">
                  <span className="text-[var(--muted)]">
                    Última vez
                    online
                  </span>

                  <span className="text-right font-medium text-[var(--text)]">
                    {formatDateTime(
                      item.lastOnlineAt
                    )}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-3">
                  <span className="text-[var(--muted)]">
                    Última queda
                  </span>

                  <span className="text-right font-medium text-[var(--text)]">
                    {formatDateTime(
                      item.lastOfflineAt
                    )}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-[var(--muted)]">
                    Sucessos
                    consecutivos
                  </span>

                  <span className="text-right font-medium text-[var(--text)]">
                    {
                      item.consecutiveSuccesses
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="text-base font-semibold text-[var(--text)]">
                Notificações
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-3">
                  <span className="text-[var(--muted)]">
                    Último alerta
                    de queda
                  </span>

                  <span className="text-right font-medium text-[var(--text)]">
                    {formatDateTime(
                      item.lastNotifiedDownAt
                    )}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-[var(--muted)]">
                    Último alerta
                    de recuperação
                  </span>

                  <span className="text-right font-medium text-[var(--text)]">
                    {formatDateTime(
                      item.lastNotifiedRecoveryAt
                    )}
                  </span>
                </div>
              </div>

              {item.lastError && (
                <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                  <div className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                    Último erro
                  </div>

                  <div className="mt-1 break-words text-sm text-[var(--text)]">
                    {
                      item.lastError
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Histórico */}

      <div className="mt-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">
              Histórico de
              incidentes
            </h2>

            <p className="text-sm text-[var(--muted)]">
              Quedas confirmadas
              e períodos de
              indisponibilidade
              registrados pelo
              worker.
            </p>
          </div>

          <div className="text-xs text-[var(--muted)]">
            {incidents?.total ??
              0}{" "}
            incidente(s) no
            total
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {(
            incidents?.items
              .length ?? 0
          ) === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
              <div className="text-sm font-medium text-[var(--text)]">
                Nenhum incidente
                registrado
              </div>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Ótimo sinal:
                ainda não existe
                nenhuma queda
                confirmada para
                este site.
              </p>
            </div>
          ) : (
            incidents?.items.map(
              (
                incident
              ) => (
                <IncidentCard
                  key={
                    incident.id
                  }
                  item={
                    incident
                  }
                  now={now}
                />
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}
