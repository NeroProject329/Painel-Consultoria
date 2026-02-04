export type NumberItem = {
  _id: string;
  name: string;
  phone: string;
};

export type DomainItem = {
  _id: string;
  domain: string;
  isActive: boolean;
  activeNumberId?: NumberItem | null;
};
