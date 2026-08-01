import type { ReactNode } from "react";

export type ErpRole = "SUPER_ADMIN" | "OFFICE_ADMIN" | "OFFICE_STAFF" | "EXECUTIVE" | "BRANCH_MANAGER";

export type ErpResource =
  | "members"
  | "pharmacies"
  | "branches"
  | "committees"
  | "dues"
  | "payments"
  | "documents"
  | "meeting-docs"
  | "press"
  | "tickets"
  | "approvals"
  | "events"
  | "settings"
  | "audit-logs";

export type ErpRecord = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  branchId?: string;
  branchName?: string;
  year?: number;
  type?: string;
  owner?: string;
  amount?: number;
  date?: string;
  updatedAt?: string;
  fields: Record<string, string | number | boolean>;
};

export type ErpListResponse = {
  items: ErpRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type ErpDetailResponse = {
  item: ErpRecord;
};

export type ErpMutationResponse = {
  ok: true;
  item?: ErpRecord;
  message: string;
};

export type ErpColumn = {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "right" | "center";
  render?: (item: ErpRecord) => ReactNode;
};

export type ErpFilter = {
  key: string;
  label: string;
  options: string[];
};

export type ErpPageConfig = {
  resource: ErpResource;
  activeModule: string;
  activeMenu: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: string;
  destructiveAction: string;
  statusAction: string;
  emptyTitle: string;
  emptyDescription: string;
  filters: ErpFilter[];
  columns: ErpColumn[];
  formFields: Array<{
    key: string;
    label: string;
    type?: "text" | "number" | "date" | "select";
    options?: string[];
  }>;
};
