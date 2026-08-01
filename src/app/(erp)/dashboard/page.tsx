"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, ClipboardCheck, Ticket, Users, WalletCards } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AISummaryCard } from "@/components/dashboard/AISummaryCard";
import { BranchStatsTable } from "@/components/dashboard/BranchStatsTable";
import { DashboardChartCard } from "@/components/dashboard/DashboardChartCard";
import { DuesLineChart } from "@/components/dashboard/DuesLineChart";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RecentDocumentsTable } from "@/components/dashboard/RecentDocumentsTable";
import { RecentTicketsTable } from "@/components/dashboard/RecentTicketsTable";
import { StaffPerformanceCard } from "@/components/dashboard/StaffPerformanceCard";
import type { DashboardAiSummarySection, DashboardPeriod, DashboardSummaryResponse } from "@/types/dashboard";

const periodLabels: Record<DashboardPeriod, string> = {
  day: "일간",
  week: "주간",
  month: "당월",
  custom: "커스텀"
};

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>("month");
  const [startDate, setStartDate] = useState("2026-07-01");
  const [endDate, setEndDate] = useState("2026-07-31");
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isRefreshingAi, setIsRefreshingAi] = useState(false);
  const [aiErrorMessage, setAiErrorMessage] = useState<string | undefined>();

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(undefined);
    const params = new URLSearchParams({ period });
    if (period === "custom") {
      params.set("startDate", startDate);
      params.set("endDate", endDate);
    }

    try {
      const response = await fetch(`/api/dashboard/summary?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("대시보드 데이터를 불러오지 못했습니다.");
      setData((await response.json()) as DashboardSummaryResponse);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "대시보드 데이터를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [endDate, period, startDate]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  const refreshAiSummary = useCallback(async () => {
    setIsRefreshingAi(true);
    setAiErrorMessage(undefined);
    try {
      const response = await fetch("/api/dashboard/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period,
          startDate: period === "custom" ? startDate : undefined,
          endDate: period === "custom" ? endDate : undefined,
          force: true
        })
      });
      const payload = (await response.json().catch(() => ({}))) as { sections?: DashboardAiSummarySection[]; generatedAt?: string; message?: string };
      if (!response.ok) throw new Error(payload.message ?? "AI 요약 생성에 실패했습니다.");
      if (payload.sections?.length) {
        setData((current) =>
          current
            ? {
                ...current,
                aiSummarySections: payload.sections ?? current.aiSummarySections,
                aiSummary: (payload.sections ?? current.aiSummarySections).flatMap((section) => section.lines),
                generatedAt: payload.generatedAt ?? current.generatedAt
              }
            : current
        );
      }
    } catch (error) {
      setAiErrorMessage(error instanceof Error ? error.message : "AI 요약 생성에 실패했습니다.");
    } finally {
      setIsRefreshingAi(false);
    }
  }, [endDate, period, startDate]);

  if (isLoading && !data) {
    return (
      <AdminLayout activeModule="dashboard" activeMenu="home">
        <div className="dashboard-page">
          <p className="dashboard-state">대시보드 데이터를 불러오는 중입니다.</p>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout activeModule="dashboard" activeMenu="home">
        <div className="dashboard-page">
          <p className="dashboard-state error">{errorMessage ?? "대시보드 데이터를 표시할 수 없습니다."}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeModule="dashboard" activeMenu="home">
      <div className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">인천시약사회 ERP_v1</p>
            <h1 className="dashboard-title">홈 대시보드</h1>
            <p className="dashboard-description">회원, 약국, 회비, 업무요청, 결재 현황을 한 화면에서 확인합니다.</p>
          </div>
          <div className="period-control">
            <div className="period-tabs" role="tablist" aria-label="기간 필터">
              {(Object.keys(periodLabels) as DashboardPeriod[]).map((key) => (
                <button
                  className={`period-tab ${period === key ? "active" : ""}`}
                  key={key}
                  onClick={() => setPeriod(key)}
                  role="tab"
                  type="button"
                  aria-selected={period === key}
                >
                  {periodLabels[key]}
                </button>
              ))}
            </div>
            {period === "custom" ? (
              <div className="custom-period">
                <input className="date-input" aria-label="시작일" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                <input className="date-input" aria-label="종료일" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
                <button className="primary-button" type="button" onClick={() => void loadDashboard()}>
                  적용
                </button>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setStartDate("2026-07-01");
                    setEndDate("2026-07-31");
                  }}
                  type="button"
                >
                  초기화
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <section className="metrics-grid" aria-label="핵심 지표">
          <MetricCard
            title="전체 회원 수"
            value={`${data.metrics.totalMembers.toLocaleString()}명`}
            icon={<Users size={18} />}
            trend={data.metricTrends.totalMembers}
          />
          <MetricCard
            title="정상 약국 수"
            value={`${data.metrics.activePharmacies.toLocaleString()}개소`}
            icon={<Building2 size={18} />}
            trend={data.metricTrends.activePharmacies}
          />
          <MetricCard
            title="회비 납부율"
            value={`${data.metrics.duesPaymentRate}%`}
            description={`미납 ${data.metrics.unpaidMembers.toLocaleString()}명`}
            icon={<WalletCards size={18} />}
            trend={data.metricTrends.duesPaymentRate}
          />
          <MetricCard
            title="미처리 업무"
            value={`${data.metrics.unresolvedTickets.toLocaleString()}건`}
            description={`긴급 ${data.metrics.urgentTickets.toLocaleString()}건`}
            icon={<Ticket size={18} />}
            trend={data.metricTrends.unresolvedTickets}
          />
          <MetricCard
            title="결재 대기"
            value={`${data.metrics.pendingApprovals.toLocaleString()}건`}
            icon={<ClipboardCheck size={18} />}
            trend={data.metricTrends.pendingApprovals}
          />
        </section>

        <AISummaryCard
          sections={data.aiSummarySections}
          summaryLines={data.aiSummary}
          generatedAt={data.generatedAt}
          isRefreshing={isRefreshingAi}
          errorMessage={aiErrorMessage ?? data.aiSummaryError}
          onRefresh={() => void refreshAiSummary()}
        />

        <section className="dashboard-main-grid">
          <DashboardChartCard title="회비 납부 추이" tabs={["daily", "cumulative"]} activeTab="cumulative">
            <DuesLineChart data={data.duesChart} />
          </DashboardChartCard>
          <StaffPerformanceCard items={data.staffPerformance} />
        </section>

        <section className="table-grid">
          <BranchStatsTable items={data.branchStats} />
          <RecentTicketsTable items={data.recentTickets} />
          <RecentDocumentsTable items={data.recentDocuments} />
        </section>
      </div>
    </AdminLayout>
  );
}
