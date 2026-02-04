export type ActiveInDomain = { id: string; domain: string };

export type DomainNumberDetail = {
  id: string;
  name: string;
  phone: string;
  isActiveHere: boolean;
  activeInDomains: ActiveInDomain[]; // pode conter outros domínios
};

export type DomainDetail = {
  id: string;
  domain: string;
  isActive: boolean;
  activeNumberId: string | null;
  numbers: DomainNumberDetail[];
};
