export type MetricsPeriod =
  | "hour"
  | "day"
  | "week";

export type MetricsNumberItem = {
  numberId: string;

  phone: string;
  attendantName: string;

  clicks: number;
  deleted: boolean;
};

export type MetricsResponse = {
  ok: boolean;

  period: {
    period: MetricsPeriod;

    date: string;
    hour: number | null;

    startDate: string;
    endDate: string;

    label: string;
  };

  summary: {
    totalClicks: number;
    numbersWithClicks: number;
    totalNumbers: number;
    averagePerNumber: number;

    topNumber:
      | MetricsNumberItem
      | null;
  };

  items: MetricsNumberItem[];
};