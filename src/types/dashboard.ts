import type { ReactNode } from "react";

export type DashboardPeriod = "day" | "week" | "month" | "custom";

export type DashboardAiSummarySection = {
  title: string;
  lines: string[];
};

export type DashboardMetricTrend = {
  type: "up" | "down" | "neutral";
  label: string;
};

export type DashboardMetrics = {
  totalMembers: number;
  activePharmacies: number;
  duesPaymentRate: number;
  unresolvedTickets: number;
  pendingApprovals: number;
  unpaidMembers: number;
  urgentTickets: number;
  upcomingEvents: number;
};

export type DuesChartPoint = {
  date: string;
  paidAmount: number;
  paidCount: number;
  cumulativeRate: number;
  previousMonthRate?: number;
  previousYearRate?: number;
};

export type StaffPerformance = {
  staffName: string;
  completedCount: number;
  processingCount: number;
  delayedCount: number;
  targetCount?: number;
};

export type BranchStat = {
  branchName: string;
  memberCount: number;
  pharmacyCount: number;
  paymentRate: number;
  unpaidCount: number;
};

export type TicketPriority = "긴급" | "높음" | "보통" | "낮음";

export type RecentTicket = {
  id: string;
  createdAt: string;
  ticketType: string;
  requesterName: string;
  title: string;
  assignedUserName: string;
  status: string;
  priority: TicketPriority;
};

export type RecentDocument = {
  id: string;
  createdAt: string;
  documentNo: string;
  documentType: string;
  title: string;
  authorName: string;
  approvalStatus: string;
};

export type AuditLog = {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type DashboardSummaryResponse = {
  period: DashboardPeriod;
  startDate: string;
  endDate: string;
  metrics: DashboardMetrics;
  metricTrends: Record<keyof Pick<DashboardMetrics, "totalMembers" | "activePharmacies" | "duesPaymentRate" | "unresolvedTickets" | "pendingApprovals">, DashboardMetricTrend>;
  aiSummary: string[];
  aiSummarySections: DashboardAiSummarySection[];
  aiSummaryStatus?: string;
  aiSummaryError?: string;
  payloadHash?: string;
  generatedAt: string;
  duesChart: DuesChartPoint[];
  staffPerformance: StaffPerformance[];
  branchStats: BranchStat[];
  recentTickets: RecentTicket[];
  recentDocuments: RecentDocument[];
};

export type MetricCardProps = {
  title: string;
  value: string;
  description?: string;
  icon?: ReactNode;
  trend?: DashboardMetricTrend;
};

export type AISummaryCardProps = {
  sections: DashboardAiSummarySection[];
  summaryLines?: string[];
  generatedAt?: string;
  isRefreshing?: boolean;
  errorMessage?: string;
  onRefresh?: () => void;
};

export type DashboardChartCardProps = {
  title: string;
  tabs?: string[];
  activeTab?: string;
  children: ReactNode;
};
