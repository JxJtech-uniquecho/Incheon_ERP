import type { DashboardPeriod, DashboardSummaryResponse } from "@/types/dashboard";

export const dashboardMock: DashboardSummaryResponse = {
  period: "month",
  startDate: "2026-07-01",
  endDate: "2026-07-31",
  metrics: {
    totalMembers: 3214,
    activePharmacies: 1248,
    duesPaymentRate: 78.4,
    unresolvedTickets: 24,
    pendingApprovals: 8,
    unpaidMembers: 693,
    urgentTickets: 3,
    upcomingEvents: 4
  },
  metricTrends: {
    totalMembers: { type: "up", label: "전월 대비 +12명" },
    activePharmacies: { type: "neutral", label: "전월과 동일" },
    duesPaymentRate: { type: "up", label: "전월 대비 +4.2%p" },
    unresolvedTickets: { type: "down", label: "전주 대비 -6건" },
    pendingApprovals: { type: "neutral", label: "확인 필요" }
  },
  aiSummary: [
    "이번 달 신규 회원은 12명 증가했고, 정상 약국은 1,248개소입니다.",
    "2026년도 회비 납부율은 78.4%이며, 미납 회원은 693명입니다.",
    "현재 미처리 업무요청은 24건이며, 이 중 긴급 민원은 3건입니다.",
    "결재 대기 문서는 8건이며, 이번 주 예정된 회의·행사는 4건입니다."
  ],
  aiSummarySections: [
    {
      title: "핵심 성과 요약",
      lines: [
        "이번 달 신규 회원은 12명 증가했고, 정상 약국은 1,248개소입니다.",
        "2026년도 회비 납부율은 78.4%이며, 미납 회원은 693명입니다."
      ]
    },
    {
      title: "특이사항 분석",
      lines: ["현재 미처리 업무요청은 24건이며, 이 중 긴급 민원은 3건입니다."]
    },
    {
      title: "추천 액션 아이템",
      lines: ["결재 대기 문서 8건과 이번 주 예정된 회의·행사 4건을 우선 확인하세요."]
    }
  ],
  generatedAt: "2026-07-01T09:30:00+09:00",
  duesChart: [
    { date: "2026-07-01", paidAmount: 3200000, paidCount: 18, cumulativeRate: 72.1, previousMonthRate: 68.4, previousYearRate: 65.2 },
    { date: "2026-07-05", paidAmount: 5400000, paidCount: 31, cumulativeRate: 73.6, previousMonthRate: 69.3, previousYearRate: 66.1 },
    { date: "2026-07-10", paidAmount: 7200000, paidCount: 42, cumulativeRate: 75.2, previousMonthRate: 70.8, previousYearRate: 67.4 },
    { date: "2026-07-15", paidAmount: 9100000, paidCount: 53, cumulativeRate: 76.4, previousMonthRate: 71.9, previousYearRate: 68.2 },
    { date: "2026-07-20", paidAmount: 11200000, paidCount: 64, cumulativeRate: 77.1, previousMonthRate: 72.7, previousYearRate: 69.0 },
    { date: "2026-07-25", paidAmount: 13800000, paidCount: 79, cumulativeRate: 78.0, previousMonthRate: 73.9, previousYearRate: 70.2 },
    { date: "2026-07-31", paidAmount: 15100000, paidCount: 87, cumulativeRate: 78.4, previousMonthRate: 74.2, previousYearRate: 71.5 }
  ],
  staffPerformance: [
    { staffName: "사무국장", completedCount: 18, processingCount: 4, delayedCount: 1, targetCount: 30 },
    { staffName: "직원 A", completedCount: 25, processingCount: 6, delayedCount: 0, targetCount: 40 },
    { staffName: "직원 B", completedCount: 12, processingCount: 8, delayedCount: 2, targetCount: 30 },
    { staffName: "직원 C", completedCount: 9, processingCount: 3, delayedCount: 0 }
  ],
  branchStats: [
    { branchName: "남동구", memberCount: 412, pharmacyCount: 188, paymentRate: 81.2, unpaidCount: 77 },
    { branchName: "부평구", memberCount: 386, pharmacyCount: 172, paymentRate: 76.5, unpaidCount: 91 },
    { branchName: "미추홀구", memberCount: 334, pharmacyCount: 150, paymentRate: 79.1, unpaidCount: 70 },
    { branchName: "연수구", memberCount: 298, pharmacyCount: 138, paymentRate: 82.0, unpaidCount: 54 },
    { branchName: "서구", memberCount: 366, pharmacyCount: 160, paymentRate: 74.8, unpaidCount: 92 }
  ],
  recentTickets: [
    { id: "ticket_001", createdAt: "2026-07-01", ticketType: "회원 문의", requesterName: "홍길동", title: "약국 주소 변경 요청", assignedUserName: "직원 A", status: "처리중", priority: "보통" },
    { id: "ticket_002", createdAt: "2026-07-01", ticketType: "회비 문의", requesterName: "김민정", title: "회비 납부 확인 요청", assignedUserName: "직원 B", status: "접수", priority: "높음" },
    { id: "ticket_003", createdAt: "2026-06-30", ticketType: "민원", requesterName: "이준호", title: "긴급 약국 운영 민원 공유", assignedUserName: "사무국장", status: "담당자 배정", priority: "긴급" },
    { id: "ticket_004", createdAt: "2026-06-29", ticketType: "문서 요청", requesterName: "박서연", title: "분회 회의자료 재발급", assignedUserName: "직원 C", status: "완료", priority: "낮음" }
  ],
  recentDocuments: [
    { id: "doc_001", createdAt: "2026-07-01", documentNo: "IPA-2026-공문-0001", documentType: "발신 공문", title: "정책토론회 개최 안내", authorName: "사무국장", approvalStatus: "승인 완료" },
    { id: "doc_002", createdAt: "2026-06-30", documentNo: "IPA-2026-회의-0014", documentType: "회의자료", title: "7월 상임이사회 회의자료", authorName: "직원 A", approvalStatus: "결재 대기" },
    { id: "doc_003", createdAt: "2026-06-28", documentNo: "IPA-2026-보도-0008", documentType: "보도자료", title: "지역사회 의약품 안전 캠페인", authorName: "직원 B", approvalStatus: "검토중" }
  ]
};

export function getDashboardSummary(period: DashboardPeriod): DashboardSummaryResponse {
  return {
    ...dashboardMock,
    period,
    duesChart: period === "day" ? dashboardMock.duesChart.slice(0, 2) : dashboardMock.duesChart
  };
}
