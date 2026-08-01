import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  BranchStat,
  DashboardAiSummarySection,
  DashboardMetricTrend,
  DashboardMetrics,
  DashboardPeriod,
  DashboardSummaryResponse,
  DuesChartPoint,
  RecentDocument,
  RecentTicket,
  StaffPerformance,
  TicketPriority
} from "@/types/dashboard";

const completedStatuses = new Set(["완료", "종결", "처리완료", "승인 완료"]);
const pendingApprovalStatuses = new Set(["대기", "진행", "검토중", "결재 대기"]);
const sectionTitles = ["핵심 성과 요약", "특이사항 분석", "추천 액션 아이템"];

export type DashboardDateRange = {
  period: DashboardPeriod;
  startDate: Date;
  endDate: Date;
};

type DashboardAiPayload = {
  period: DashboardPeriod;
  startDate: string;
  endDate: string;
  metrics: DashboardMetrics;
  metricTrends: DashboardSummaryResponse["metricTrends"];
  duesChart: DuesChartPoint[];
  staffPerformance: StaffPerformance[];
  branchStats: BranchStat[];
  recentOperationalItems: {
    tickets: Array<Pick<RecentTicket, "createdAt" | "ticketType" | "title" | "assignedUserName" | "status" | "priority">>;
    documents: Array<Pick<RecentDocument, "createdAt" | "documentNo" | "documentType" | "title" | "authorName" | "approvalStatus">>;
  };
};

function dateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function startOfDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function rangeWhere(field: string, range: DashboardDateRange) {
  return {
    [field]: {
      gte: range.startDate,
      lt: addDays(range.endDate, 1)
    }
  };
}

function parseDateParam(value?: string | null) {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function resolveDashboardDateRange(period: DashboardPeriod, startDate?: string | null, endDate?: string | null): DashboardDateRange {
  const today = startOfDay(new Date());
  if (period === "custom") {
    const start = parseDateParam(startDate) ?? today;
    const end = parseDateParam(endDate) ?? start;
    return start <= end ? { period, startDate: start, endDate: end } : { period, startDate: end, endDate: start };
  }

  if (period === "day") return { period, startDate: today, endDate: today };
  if (period === "week") return { period, startDate: addDays(today, -6), endDate: today };

  return {
    period,
    startDate: new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)),
    endDate: new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0))
  };
}

function previousRange(range: DashboardDateRange): DashboardDateRange {
  const days = Math.max(1, Math.round((range.endDate.getTime() - range.startDate.getTime()) / 86400000) + 1);
  const endDate = addDays(range.startDate, -1);
  return { ...range, startDate: addDays(endDate, -(days - 1)), endDate };
}

function trend(current: number, previous: number, unit = ""): DashboardMetricTrend {
  const delta = Math.round((current - previous) * 10) / 10;
  if (delta > 0) return { type: "up", label: `이전 기간 대비 +${delta.toLocaleString()}${unit}` };
  if (delta < 0) return { type: "down", label: `이전 기간 대비 ${delta.toLocaleString()}${unit}` };
  return { type: "neutral", label: "이전 기간과 동일" };
}

function paymentRate(amountPaid: number, amountDue: number) {
  if (amountDue <= 0) return 0;
  return Math.round((amountPaid / amountDue) * 1000) / 10;
}

function dueRangeWhere(range: DashboardDateRange): Prisma.DueWhereInput {
  return {
    deletedAt: null,
    year: range.endDate.getUTCFullYear(),
    OR: [rangeWhere("createdAt", range), rangeWhere("paidAt", range)]
  };
}

async function metricsForRange(range: DashboardDateRange): Promise<DashboardMetrics> {
  const dueWhere = dueRangeWhere(range);
  const eventDateWhere = range.period === "day" || range.period === "week" || range.period === "custom"
    ? { startsAt: { gte: range.startDate, lt: addDays(range.endDate, 1) } }
    : { startsAt: { gte: startOfDay(new Date()), lt: addDays(startOfDay(new Date()), 8) } };
  const [totalMembers, activePharmacies, duesAgg, unresolvedTickets, pendingApprovals, urgentTickets, upcomingEvents, unpaidDues] = await prisma.$transaction([
    prisma.member.count({ where: { deletedAt: null } }),
    prisma.pharmacy.count({ where: { deletedAt: null, status: "운영" } }),
    prisma.due.aggregate({
      where: dueWhere,
      _sum: { amountDue: true, amountPaid: true }
    }),
    prisma.ticket.count({ where: { deletedAt: null, status: { notIn: Array.from(completedStatuses) } } }),
    prisma.approval.count({ where: { deletedAt: null, status: { in: Array.from(pendingApprovalStatuses) } } }),
    prisma.ticket.count({ where: { deletedAt: null, priority: "긴급", status: { notIn: Array.from(completedStatuses) } } }),
    prisma.event.count({
      where: {
        deletedAt: null,
        status: "예정",
        ...eventDateWhere
      }
    }),
    prisma.due.findMany({
      where: {
        AND: [
          dueWhere,
          { OR: [{ status: "미납" }, { amountPaid: { lt: prisma.due.fields.amountDue } }] }
        ]
      },
      select: { memberId: true }
    })
  ]);

  const unpaidMemberIds = new Set(unpaidDues.map((due) => due.memberId).filter(Boolean));

  return {
    totalMembers,
    activePharmacies,
    duesPaymentRate: paymentRate(duesAgg._sum.amountPaid ?? 0, duesAgg._sum.amountDue ?? 0),
    unresolvedTickets,
    pendingApprovals,
    unpaidMembers: unpaidMemberIds.size || unpaidDues.length,
    urgentTickets,
    upcomingEvents
  };
}

async function buildDuesChart(range: DashboardDateRange): Promise<DuesChartPoint[]> {
  const dueWhere = dueRangeWhere(range);
  const totalDue = await prisma.due.aggregate({ where: dueWhere, _sum: { amountDue: true } });
  const paidDues = await prisma.due.findMany({
    where: { ...dueWhere, paidAt: { gte: range.startDate, lt: addDays(range.endDate, 1) }, amountPaid: { gt: 0 } },
    orderBy: { paidAt: "asc" },
    select: { paidAt: true, amountPaid: true }
  });

  const daily = new Map<string, { paidAmount: number; paidCount: number }>();
  for (const due of paidDues) {
    if (!due.paidAt) continue;
    const key = dateOnly(due.paidAt);
    const current = daily.get(key) ?? { paidAmount: 0, paidCount: 0 };
    current.paidAmount += due.amountPaid;
    current.paidCount += 1;
    daily.set(key, current);
  }

  let cumulative = 0;
  const denominator = totalDue._sum.amountDue ?? 0;
  const points = Array.from(daily.entries()).map(([date, value]) => {
    cumulative += value.paidAmount;
    return {
      date,
      paidAmount: value.paidAmount,
      paidCount: value.paidCount,
      cumulativeRate: paymentRate(cumulative, denominator)
    };
  });

  return points.length ? points : [{ date: dateOnly(range.endDate), paidAmount: 0, paidCount: 0, cumulativeRate: paymentRate(0, denominator) }];
}

async function buildStaffPerformance(range: DashboardDateRange): Promise<StaffPerformance[]> {
  const tickets = await prisma.ticket.findMany({
    where: { deletedAt: null, ...rangeWhere("createdAt", range) },
    select: { owner: true, status: true, dueDate: true }
  });
  const today = startOfDay(new Date());
  const map = new Map<string, StaffPerformance>();

  for (const ticket of tickets) {
    const staffName = ticket.owner?.trim() || "미배정";
    const item = map.get(staffName) ?? { staffName, completedCount: 0, processingCount: 0, delayedCount: 0 };
    if (completedStatuses.has(ticket.status)) item.completedCount += 1;
    else {
      item.processingCount += 1;
      if (ticket.dueDate && ticket.dueDate < today) item.delayedCount += 1;
    }
    map.set(staffName, item);
  }

  return Array.from(map.values())
    .sort((a, b) => b.completedCount + b.processingCount - (a.completedCount + a.processingCount))
    .slice(0, 5);
}

async function buildBranchStats(range: DashboardDateRange): Promise<BranchStat[]> {
  const branches = await prisma.branch.findMany({
    where: { deletedAt: null },
    include: {
      members: { where: { deletedAt: null }, select: { id: true } },
      pharmacies: { where: { deletedAt: null, status: "운영" }, select: { id: true } },
      dues: { where: dueRangeWhere(range), select: { amountDue: true, amountPaid: true, status: true, memberId: true } }
    },
    orderBy: { name: "asc" }
  });

  return branches.map((branch) => {
    const amountDue = branch.dues.reduce((sum, due) => sum + due.amountDue, 0);
    const amountPaid = branch.dues.reduce((sum, due) => sum + due.amountPaid, 0);
    const unpaid = branch.dues.filter((due) => due.status === "미납" || due.amountPaid < due.amountDue);
    return {
      branchName: branch.name,
      memberCount: branch.members.length || branch.memberCount,
      pharmacyCount: branch.pharmacies.length || branch.pharmacyCount,
      paymentRate: paymentRate(amountPaid, amountDue),
      unpaidCount: new Set(unpaid.map((due) => due.memberId).filter(Boolean)).size || unpaid.length
    };
  });
}

function ticketPriority(value?: string | null): TicketPriority {
  return value === "긴급" || value === "높음" || value === "낮음" ? value : "보통";
}

async function buildRecentTickets(range: DashboardDateRange): Promise<RecentTicket[]> {
  const tickets = await prisma.ticket.findMany({
    where: { deletedAt: null, ...rangeWhere("createdAt", range) },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, createdAt: true, ticketType: true, requester: true, title: true, owner: true, status: true, priority: true }
  });

  return tickets.map((ticket) => ({
    id: ticket.id,
    createdAt: dateOnly(ticket.createdAt),
    ticketType: ticket.ticketType ?? "-",
    requesterName: ticket.requester ?? "-",
    title: ticket.title,
    assignedUserName: ticket.owner ?? "미배정",
    status: ticket.status,
    priority: ticketPriority(ticket.priority)
  }));
}

async function buildRecentDocuments(range: DashboardDateRange): Promise<RecentDocument[]> {
  const documents = await prisma.document.findMany({
    where: {
      deletedAt: null,
      OR: [rangeWhere("documentDate", range), rangeWhere("createdAt", range)]
    },
    orderBy: [{ documentDate: "desc" }, { createdAt: "desc" }],
    take: 5,
    select: { id: true, createdAt: true, documentDate: true, documentNo: true, documentType: true, title: true, owner: true, status: true }
  });

  return documents.map((document) => ({
    id: document.id,
    createdAt: dateOnly(document.documentDate ?? document.createdAt),
    documentNo: document.documentNo ?? "-",
    documentType: document.documentType === "MEETING" ? "회의자료" : document.documentType === "PRESS" ? "보도자료" : "발신 공문",
    title: document.title,
    authorName: document.owner ?? "-",
    approvalStatus: document.status
  }));
}

function normalizeSections(value: Prisma.JsonValue | null | undefined): DashboardAiSummarySection[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const record = item as Record<string, unknown>;
      const title = typeof record.title === "string" ? record.title : "";
      const lines = Array.isArray(record.lines) ? record.lines.filter((line): line is string => typeof line === "string" && line.trim().length > 0) : [];
      return title && lines.length ? { title, lines } : null;
    })
    .filter((item): item is DashboardAiSummarySection => Boolean(item));
}

function fallbackSections(metrics: DashboardMetrics): DashboardAiSummarySection[] {
  return [
    {
      title: "핵심 성과 요약",
      lines: [`전체 회원 ${metrics.totalMembers.toLocaleString()}명, 정상 약국 ${metrics.activePharmacies.toLocaleString()}개소를 관리 중입니다.`]
    },
    {
      title: "특이사항 분석",
      lines: [`회비 납부율은 ${metrics.duesPaymentRate}%이며, 미처리 업무 ${metrics.unresolvedTickets.toLocaleString()}건 중 긴급 ${metrics.urgentTickets.toLocaleString()}건이 남아 있습니다.`]
    },
    {
      title: "추천 액션 아이템",
      lines: [`결재 대기 ${metrics.pendingApprovals.toLocaleString()}건과 미납 회원 ${metrics.unpaidMembers.toLocaleString()}명을 우선 점검하세요.`]
    }
  ];
}

function buildPayload(summary: Omit<DashboardSummaryResponse, "aiSummary" | "aiSummarySections" | "aiSummaryStatus" | "aiSummaryError" | "payloadHash" | "generatedAt">): DashboardAiPayload {
  return {
    period: summary.period,
    startDate: summary.startDate,
    endDate: summary.endDate,
    metrics: summary.metrics,
    metricTrends: summary.metricTrends,
    duesChart: summary.duesChart,
    staffPerformance: summary.staffPerformance,
    branchStats: summary.branchStats,
    recentOperationalItems: {
      tickets: summary.recentTickets.map(({ createdAt, ticketType, title, assignedUserName, status, priority }) => ({
        createdAt,
        ticketType,
        title,
        assignedUserName,
        status,
        priority
      })),
      documents: summary.recentDocuments.map(({ createdAt, documentNo, documentType, title, authorName, approvalStatus }) => ({
        createdAt,
        documentNo,
        documentType,
        title,
        authorName,
        approvalStatus
      }))
    }
  };
}

export function hashDashboardPayload(payload: DashboardAiPayload) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export async function getDashboardAggregate(range: DashboardDateRange) {
  const [metrics, previousMetrics, duesChart, staffPerformance, branchStats, recentTickets, recentDocuments] = await Promise.all([
    metricsForRange(range),
    metricsForRange(previousRange(range)),
    buildDuesChart(range),
    buildStaffPerformance(range),
    buildBranchStats(range),
    buildRecentTickets(range),
    buildRecentDocuments(range)
  ]);

  const base = {
    period: range.period,
    startDate: dateOnly(range.startDate),
    endDate: dateOnly(range.endDate),
    metrics,
    metricTrends: {
      totalMembers: trend(metrics.totalMembers, previousMetrics.totalMembers, "명"),
      activePharmacies: trend(metrics.activePharmacies, previousMetrics.activePharmacies, "개소"),
      duesPaymentRate: trend(metrics.duesPaymentRate, previousMetrics.duesPaymentRate, "%p"),
      unresolvedTickets: trend(metrics.unresolvedTickets, previousMetrics.unresolvedTickets, "건"),
      pendingApprovals: trend(metrics.pendingApprovals, previousMetrics.pendingApprovals, "건")
    },
    duesChart,
    staffPerformance,
    branchStats,
    recentTickets,
    recentDocuments
  };
  const aiPayload = buildPayload(base);
  return { base, aiPayload, payloadHash: hashDashboardPayload(aiPayload) };
}

export async function getDashboardSummary(range: DashboardDateRange): Promise<DashboardSummaryResponse> {
  const { base, payloadHash } = await getDashboardAggregate(range);
  const cached = await prisma.dashboardAiSummary.findFirst({
    where: { period: range.period, startDate: range.startDate, endDate: range.endDate },
    orderBy: { generatedAt: "desc" }
  });
  const sections = normalizeSections(cached?.sections) || [];
  const normalized = sections.length ? sections : fallbackSections(base.metrics);

  return {
    ...base,
    aiSummary: normalized.flatMap((section) => section.lines),
    aiSummarySections: normalized,
    aiSummaryStatus: cached?.status,
    aiSummaryError: cached?.status === "ERROR" ? cached.errorMessage ?? undefined : undefined,
    payloadHash,
    generatedAt: (cached?.generatedAt ?? new Date()).toISOString()
  };
}

export function parsePeriod(value?: string | null): DashboardPeriod {
  return value === "day" || value === "week" || value === "custom" ? value : "month";
}

export { sectionTitles };
export type { DashboardAiPayload };
