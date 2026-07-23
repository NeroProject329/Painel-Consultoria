"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "@/lib/api";

import type {
  MetricsPeriod,
  MetricsResponse,
} from "@/types/metrics";

const TIMEZONE =
  "America/Sao_Paulo";

function getSaoPauloNow() {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: TIMEZONE,

        year: "numeric",
        month: "2-digit",
        day: "2-digit",

        hour: "2-digit",
        hourCycle: "h23",
      }
    ).formatToParts(
      new Date()
    );

  const map =
    Object.fromEntries(
      parts
        .filter(
          (part) =>
            part.type !== "literal"
        )
        .map((part) => [
          part.type,
          part.value,
        ])
    ) as Record<string, string>;

  return {
    date:
      `${map.year}-` +
      `${map.month}-` +
      `${map.day}`,

    hour: Number(map.hour),
  };
}

function addDays(
  dateKey: string,
  amount: number
) {
  const [year, month, day] =
    dateKey
      .split("-")
      .map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      12
    )
  );

  date.setUTCDate(
    date.getUTCDate() + amount
  );

  return date
    .toISOString()
    .slice(0, 10);
}

function formatDateBR(
  dateKey: string
) {
  const [year, month, day] =
    dateKey.split("-");

  if (
    !year ||
    !month ||
    !day
  ) {
    return dateKey;
  }

  return `${day}/${month}/${year}`;
}

function formatPhone(
  phone: string
) {
  const digits = String(
    phone || ""
  ).replace(/\D/g, "");

  if (
    digits.length === 13 &&
    digits.startsWith("55")
  ) {
    return (
      `+55 (${digits.slice(2, 4)}) ` +
      `${digits.slice(4, 9)}-` +
      `${digits.slice(9)}`
    );
  }

  if (
    digits.length === 12 &&
    digits.startsWith("55")
  ) {
    return (
      `+55 (${digits.slice(2, 4)}) ` +
      `${digits.slice(4, 8)}-` +
      `${digits.slice(8)}`
    );
  }

  if (digits.length === 11) {
    return (
      `(${digits.slice(0, 2)}) ` +
      `${digits.slice(2, 7)}-` +
      `${digits.slice(7)}`
    );
  }

  return phone;
}

function periodName(
  period: MetricsPeriod
) {
  if (period === "hour") {
    return "Por hora";
  }

  if (period === "week") {
    return "Por semana";
  }

  return "Por dia";
}

export default function MetricsPage() {
  const now = useMemo(
    () => getSaoPauloNow(),
    []
  );

  const [
    period,
    setPeriod,
  ] = useState<MetricsPeriod>(
    "day"
  );

  const [
    date,
    setDate,
  ] = useState(
    now.date
  );

  const [
    hour,
    setHour,
  ] = useState(
    now.hour
  );

  const [
    followCurrentPeriod,
    setFollowCurrentPeriod,
  ] = useState(true);

  const [
    refreshKey,
    setRefreshKey,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    err,
    setErr,
  ] = useState<
    string | null
  >(null);

  const [
    metrics,
    setMetrics,
  ] = useState<
    MetricsResponse | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        const { data } =
          await api.get<MetricsResponse>(
            "/admin/metrics/clicks",
            {
              params: {
                period,
                date,

                hour:
                  period === "hour"
                    ? hour
                    : undefined,
              },
            }
          );

        if (!cancelled) {
          setMetrics(data);
        }
      } catch (error: any) {
        if (!cancelled) {
          setErr(
            error?.response
              ?.data?.error ||
              "Erro ao carregar as métricas de cliques."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    period,
    date,
    hour,
    refreshKey,
  ]);

  /*
   * Quando estiver em Hoje,
   * troca automaticamente a data
   * ao passar da meia-noite.
   */
  useEffect(() => {
    if (!followCurrentPeriod) {
      return;
    }

    const syncCurrentPeriod = () => {
      const current =
        getSaoPauloNow();

      setDate(current.date);
      setHour(current.hour);
    };

    syncCurrentPeriod();

    const timer =
      window.setInterval(
        syncCurrentPeriod,
        60_000
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [followCurrentPeriod]);

  function selectToday() {
    const current =
      getSaoPauloNow();

    setFollowCurrentPeriod(
      true
    );

    setDate(current.date);
    setHour(current.hour);
  }

  function selectYesterday() {
    const current =
      getSaoPauloNow();

    setFollowCurrentPeriod(
      false
    );

    setDate(
      addDays(
        current.date,
        -1
      )
    );
  }

  function changePeriod(
    next: MetricsPeriod
  ) {
    setPeriod(next);

    if (followCurrentPeriod) {
      const current =
        getSaoPauloNow();

      setDate(current.date);
      setHour(current.hour);
    }
  }

  const maxClicks = Math.max(
    ...(
      metrics?.items.map(
        (item) => item.clicks
      ) ?? [0]
    ),
    1
  );

  const periodLabel = metrics
    ? metrics.period.period ===
      "hour"
      ? `${formatDateBR(
          metrics.period.date
        )}, das ${String(
          metrics.period.hour ?? 0
        ).padStart(
          2,
          "0"
        )}:00 às ${String(
          metrics.period.hour ?? 0
        ).padStart(
          2,
          "0"
        )}:59`
      : metrics.period.period ===
          "week"
        ? `${formatDateBR(
            metrics.period.startDate
          )} até ${formatDateBR(
            metrics.period.endDate
          )}`
        : formatDateBR(
            metrics.period.date
          )
    : "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">
            Métricas de cliques
          </h1>

          <p className="text-sm text-neutral-600">
            Veja quantos cliques cada número recebeu no período selecionado.
          </p>
        </div>

        <button
          onClick={() =>
            setRefreshKey(
              (value) =>
                value + 1
            )
          }
          disabled={loading}
          className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
        >
          {loading
            ? "Atualizando..."
            : "Atualizar dados"}
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="text-base font-semibold text-neutral-900">
          Período da análise
        </div>

        <p className="text-sm text-neutral-600">
          Os cliques não são apagados. O painel apenas mostra os registros da hora, dia ou semana escolhida.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              "hour",
              "day",
              "week",
            ] as MetricsPeriod[]
          ).map((item) => {
            const active =
              period === item;

            return (
              <button
                key={item}
                onClick={() =>
                  changePeriod(
                    item
                  )
                }
                className={[
                  "rounded-xl border px-4 py-2 text-sm font-medium transition",

                  active
                    ? "border-sky-500 bg-sky-500 text-white"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
                ].join(" ")}
              >
                {periodName(item)}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto] md:items-end">
          <label className="block">
            <span className="text-sm text-neutral-600">
              Data de referência
            </span>

            <input
              type="date"
              value={date}
              onChange={(event) => {
                setFollowCurrentPeriod(
                  false
                );

                setDate(
                  event.target.value
                );
              }}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
            />
          </label>

          {period === "hour" ? (
            <label className="block">
              <span className="text-sm text-neutral-600">
                Hora
              </span>

              <select
                value={hour}
                onChange={(event) => {
                  setFollowCurrentPeriod(
                    false
                  );

                  setHour(
                    Number(
                      event.target.value
                    )
                  );
                }}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
              >
                {Array.from(
                  {
                    length: 24,
                  },
                  (_, index) => (
                    <option
                      key={index}
                      value={index}
                    >
                      {String(
                        index
                      ).padStart(
                        2,
                        "0"
                      )}
                      :00 até{" "}
                      {String(
                        index
                      ).padStart(
                        2,
                        "0"
                      )}
                      :59
                    </option>
                  )
                )}
              </select>
            </label>
          ) : (
            <div className="hidden md:block" />
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={selectToday}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
            >
              Hoje
            </button>

            <button
              onClick={
                selectYesterday
              }
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
            >
              Ontem
            </button>
          </div>
        </div>

        {followCurrentPeriod && (
          <div className="mt-3 text-xs text-sky-700">
            Acompanhando automaticamente o período atual no fuso de São Paulo.
          </div>
        )}
      </div>

      {err && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4">
        <div className="text-xs font-medium uppercase tracking-wide text-sky-700">
          Período exibido
        </div>

        <div className="mt-1 text-base font-semibold text-sky-950">
          {periodLabel ||
            "Carregando período..."}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="text-sm text-neutral-500">
            Total de cliques
          </div>

          <div className="mt-2 text-3xl font-semibold text-neutral-900">
            {metrics?.summary
              .totalClicks ?? 0}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="text-sm text-neutral-500">
            Números com cliques
          </div>

          <div className="mt-2 text-3xl font-semibold text-neutral-900">
            {metrics?.summary
              .numbersWithClicks ?? 0}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="text-sm text-neutral-500">
            Média por número
          </div>

          <div className="mt-2 text-3xl font-semibold text-neutral-900">
            {(
              metrics?.summary
                .averagePerNumber ?? 0
            ).toLocaleString(
              "pt-BR",
              {
                maximumFractionDigits: 1,
              }
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="text-sm text-neutral-500">
            Mais clicado
          </div>

          {metrics?.summary
            .topNumber ? (
            <div className="mt-2">
              <div className="text-base font-semibold text-neutral-900">
                {
                  metrics.summary
                    .topNumber
                    .attendantName
                }
              </div>

              <div className="text-xs text-neutral-600">
                {formatPhone(
                  metrics.summary
                    .topNumber
                    .phone
                )}{" "}
                •{" "}
                {
                  metrics.summary
                    .topNumber
                    .clicks
                }{" "}
                clique(s)
              </div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-neutral-600">
              Nenhum clique no período
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 p-4">
          <div className="text-base font-semibold text-neutral-900">
            Cliques por número
          </div>

          <p className="text-sm text-neutral-600">
            Ordenado do número com mais cliques para o número com menos cliques.
          </p>
        </div>

        {loading && !metrics ? (
          <div className="p-6 text-sm text-neutral-600">
            Carregando métricas…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-4 py-3 font-medium">
                    Número
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Responsável
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Participação
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Cliques
                  </th>
                </tr>
              </thead>

              <tbody>
                {(
                  metrics?.items ?? []
                ).map((item) => {
                  const width =
                    item.clicks > 0
                      ? Math.max(
                          (
                            item.clicks /
                            maxClicks
                          ) * 100,
                          4
                        )
                      : 0;

                  return (
                    <tr
                      key={
                        item.numberId
                      }
                      className="border-b border-neutral-100 last:border-b-0"
                    >
                      <td className="px-4 py-4 text-sm font-medium text-neutral-900">
                        {formatPhone(
                          item.phone
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-sm text-neutral-900">
                          {
                            item.attendantName
                          }
                        </div>

                        {item.deleted && (
                          <span className="mt-1 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                            Número excluído
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-sky-500 transition-all"
                            style={{
                              width:
                                `${width}%`,
                            }}
                          />
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right text-lg font-semibold text-neutral-900">
                        {item.clicks}
                      </td>
                    </tr>
                  );
                })}

                {(
                  metrics?.items
                    .length ?? 0
                ) === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-sm text-neutral-600"
                    >
                      Nenhum número cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}