export type MonitoringStatus =
  | "unknown"
  | "online"
  | "offline"
  | "unstable";

export type SiteMonitorItem = {
  id: string;

  domainId: string;

  domain: string;

  url: string;

  enabled: boolean;

  status:
    | "unknown"
    | "online"
    | "offline"
    | string;

  displayStatus: MonitoringStatus;

  lastHttpStatus:
    | number
    | null;

  lastResponseTimeMs:
    | number
    | null;

  consecutiveFailures: number;

  consecutiveSuccesses: number;

  lastCheckedAt:
    | string
    | null;

  lastOnlineAt:
    | string
    | null;

  lastOfflineAt:
    | string
    | null;

  offlineSince:
    | string
    | null;

  lastError:
    | string
    | null;

  lastNotifiedDownAt:
    | string
    | null;

  lastNotifiedRecoveryAt:
    | string
    | null;

  createdAt:
    | string
    | null;

  updatedAt:
    | string
    | null;
};

export type MonitoringSummary = {
  total: number;

  enabled: number;

  disabled: number;

  online: number;

  offline: number;

  unstable: number;

  unknown: number;
};

export type MonitoringListResponse = {
  ok: boolean;

  summary: MonitoringSummary;

  items: SiteMonitorItem[];
};

export type SiteIncidentItem = {
  id: string;

  monitorId: string;

  domainId: string;

  domain: string;

  startedAt: string;

  endedAt:
    | string
    | null;

  durationMs:
    | number
    | null;

  reason:
    | string
    | null;

  httpStatus:
    | number
    | null;

  downNotifiedAt:
    | string
    | null;

  recoveryNotifiedAt:
    | string
    | null;

  isOpen: boolean;
};

export type MonitoringDetailItem =
  SiteMonitorItem & {
    incidentCount: number;

    openIncident:
      | SiteIncidentItem
      | null;
  };

export type MonitoringDetailResponse = {
  ok: boolean;

  item: MonitoringDetailItem;
};

export type MonitoringIncidentsResponse = {
  ok: boolean;

  monitor: {
    id: string;

    domain: string;

    status: string;

    displayStatus: MonitoringStatus;
  };

  total: number;

  limit: number;

  items: SiteIncidentItem[];
};