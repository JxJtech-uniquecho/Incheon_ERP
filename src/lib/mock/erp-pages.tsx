import { StatusBadge } from "@/components/erp/StatusBadge";
import type { ReactNode } from "react";
import type { ErpPageConfig, ErpRecord, ErpResource } from "@/types/erp";

const branchFilter = { key: "branchId", label: "분회", options: ["전체", "branch_namdong", "branch_bupyeong", "branch_michuhol", "branch_yeonsu", "branch_seo"] };
const yearFilter = { key: "year", label: "연도", options: ["전체", "2026", "2025", "2024"] };

function won(value?: number) {
  return typeof value === "number" ? `${value.toLocaleString()}원` : "-";
}

function baseColumns(extra: Array<{ key: string; label: string; render?: (item: ErpRecord) => ReactNode }> = []) {
  return [
    { key: "title", label: "항목", width: "28%" },
    { key: "branchName", label: "분회", render: (item: ErpRecord) => item.branchName ?? "-" },
    { key: "status", label: "상태", render: (item: ErpRecord) => <StatusBadge status={item.status} /> },
    ...extra,
    { key: "updatedAt", label: "기준일", render: (item: ErpRecord) => item.updatedAt ?? item.date ?? "-" }
  ];
}

const commonFormFields = [
  { key: "title", label: "제목" },
  { key: "subtitle", label: "보조 설명" },
  { key: "status", label: "상태" },
  { key: "owner", label: "담당자" }
];

export const erpPageConfigs: Record<string, ErpPageConfig> = {
  members: {
    resource: "members",
    activeModule: "members",
    activeMenu: "members",
    eyebrow: "회원",
    title: "회원 관리",
    description: "면허번호, 이름, 분회, 회원 상태 기준으로 회원 정보를 조회하고 등록/수정/탈퇴 처리합니다.",
    primaryAction: "회원 등록",
    destructiveAction: "탈퇴 처리",
    statusAction: "상태 변경",
    emptyTitle: "조건에 맞는 회원이 없습니다",
    emptyDescription: "검색어나 상태 필터를 조정하거나 새 회원을 등록하세요.",
    filters: [branchFilter, { key: "status", label: "상태", options: ["전체", "정상", "휴면", "탈퇴처리"] }],
    columns: baseColumns([{ key: "license", label: "면허번호", render: (item) => item.fields.면허번호 }]),
    formFields: [...commonFormFields, { key: "license", label: "면허번호" }, { key: "phone", label: "휴대전화" }]
  },
  pharmacies: {
    resource: "pharmacies",
    activeModule: "members",
    activeMenu: "pharmacies",
    eyebrow: "회원",
    title: "약국 관리",
    description: "약국 주소, 대표약사, 운영상태를 기준으로 약국 정보를 관리합니다.",
    primaryAction: "약국 등록",
    destructiveAction: "폐업 처리",
    statusAction: "운영상태 변경",
    emptyTitle: "조건에 맞는 약국이 없습니다",
    emptyDescription: "주소나 대표약사 검색어를 바꾸거나 신규 약국을 등록하세요.",
    filters: [branchFilter, { key: "status", label: "운영상태", options: ["전체", "운영", "폐업"] }, { key: "type", label: "유형", options: ["전체", "동네약국", "문전약국"] }],
    columns: baseColumns([{ key: "owner", label: "대표약사", render: (item) => item.owner }]),
    formFields: [...commonFormFields, { key: "address", label: "주소" }, { key: "phone", label: "전화번호" }]
  },
  branches: {
    resource: "branches",
    activeModule: "members",
    activeMenu: "branches",
    eyebrow: "회원",
    title: "분회 관리",
    description: "분회별 회원/약국 통계와 분회장 정보를 관리합니다.",
    primaryAction: "분회 등록",
    destructiveAction: "분회 비활성",
    statusAction: "분회장 변경",
    emptyTitle: "조건에 맞는 분회가 없습니다",
    emptyDescription: "운영상태 필터를 변경하세요.",
    filters: [{ key: "status", label: "상태", options: ["전체", "운영", "비활성"] }],
    columns: baseColumns([{ key: "chair", label: "분회장", render: (item) => item.fields.분회장 }, { key: "stats", label: "회원/약국", render: (item) => `${item.fields.회원수}명 / ${item.fields.약국수}개소` }]),
    formFields: [...commonFormFields, { key: "chair", label: "분회장" }]
  },
  committees: {
    resource: "committees",
    activeModule: "members",
    activeMenu: "committees",
    eyebrow: "회원",
    title: "임원·위원회 관리",
    description: "직책, 위원회, 임기 기준으로 임원 정보를 관리합니다.",
    primaryAction: "임원 등록",
    destructiveAction: "임기 종료",
    statusAction: "임기상태 변경",
    emptyTitle: "조건에 맞는 임원이 없습니다",
    emptyDescription: "위원회 또는 임기 상태 필터를 조정하세요.",
    filters: [{ key: "status", label: "임기상태", options: ["전체", "임기중", "임기종료"] }, { key: "type", label: "구분", options: ["전체", "회장단", "위원회", "자문"] }],
    columns: baseColumns([{ key: "role", label: "직책/위원회", render: (item) => `${item.fields.직책} / ${item.fields.위원회}` }]),
    formFields: [...commonFormFields, { key: "role", label: "직책" }, { key: "term", label: "임기" }]
  },
  dues: {
    resource: "dues",
    activeModule: "dues",
    activeMenu: "dues",
    eyebrow: "회비",
    title: "회비 현황",
    description: "연도, 분회, 납부상태별 회비 납부율과 회원별 납부 내역을 확인합니다.",
    primaryAction: "회비 등록",
    destructiveAction: "회비 취소",
    statusAction: "납부상태 변경",
    emptyTitle: "조건에 맞는 회비 내역이 없습니다",
    emptyDescription: "연도나 납부상태 필터를 변경하세요.",
    filters: [yearFilter, branchFilter, { key: "status", label: "납부상태", options: ["전체", "납부완료", "부분납부", "미납"] }],
    columns: baseColumns([{ key: "amount", label: "납부금액", render: (item) => won(item.amount) }]),
    formFields: [...commonFormFields, { key: "amount", label: "금액", type: "number" }, { key: "date", label: "납부일", type: "date" }]
  },
  payments: {
    resource: "payments",
    activeModule: "dues",
    activeMenu: "payments",
    eyebrow: "회비",
    title: "입금 관리",
    description: "입금 내역과 회비 매칭 상태를 관리하고 미매칭 입금을 처리합니다.",
    primaryAction: "입금 등록",
    destructiveAction: "입금 삭제",
    statusAction: "매칭 처리",
    emptyTitle: "조건에 맞는 입금 내역이 없습니다",
    emptyDescription: "입금자명 또는 매칭 상태 필터를 변경하세요.",
    filters: [branchFilter, { key: "status", label: "매칭상태", options: ["전체", "매칭완료", "미매칭"] }],
    columns: baseColumns([{ key: "amount", label: "입금액", render: (item) => won(item.amount) }]),
    formFields: [...commonFormFields, { key: "amount", label: "입금액", type: "number" }, { key: "date", label: "입금일", type: "date" }]
  },
  unpaid: {
    resource: "dues",
    activeModule: "dues",
    activeMenu: "unpaid",
    eyebrow: "회비",
    title: "미납자 관리",
    description: "미납 회원 목록을 조회하고 독촉 상태와 안내 발송 mock 액션을 처리합니다.",
    primaryAction: "안내 발송",
    destructiveAction: "미납 제외",
    statusAction: "독촉상태 변경",
    emptyTitle: "미납자가 없습니다",
    emptyDescription: "현재 필터 조건에서는 모든 회원이 납부 완료 상태입니다.",
    filters: [yearFilter, branchFilter, { key: "status", label: "납부상태", options: ["전체", "미납", "부분납부"] }],
    columns: baseColumns([{ key: "amount", label: "미납금액", render: (item) => won(Number(item.fields.미납금액 ?? 0)) }]),
    formFields: [...commonFormFields, { key: "memo", label: "독촉 메모" }]
  },
  documents: {
    resource: "documents",
    activeModule: "documents",
    activeMenu: "documents",
    eyebrow: "문서",
    title: "공문 관리",
    description: "문서번호, 유형, 결재상태 기준으로 공문을 등록/수정하고 결재 요청을 mock 처리합니다.",
    primaryAction: "공문 등록",
    destructiveAction: "공문 삭제",
    statusAction: "결재 요청",
    emptyTitle: "조건에 맞는 공문이 없습니다",
    emptyDescription: "문서번호나 결재상태 필터를 조정하세요.",
    filters: [{ key: "status", label: "결재상태", options: ["전체", "결재 대기", "검토중", "승인 완료"] }, { key: "type", label: "유형", options: ["전체", "발신 공문", "수신 공문"] }],
    columns: baseColumns([{ key: "type", label: "유형", render: (item) => item.type }]),
    formFields: [...commonFormFields, { key: "documentNo", label: "문서번호" }]
  },
  "meeting-docs": {
    resource: "meeting-docs",
    activeModule: "documents",
    activeMenu: "meeting-docs",
    eyebrow: "문서",
    title: "회의자료",
    description: "회의별 자료 목록과 공개상태를 관리합니다.",
    primaryAction: "자료 등록",
    destructiveAction: "자료 삭제",
    statusAction: "공개상태 변경",
    emptyTitle: "조건에 맞는 회의자료가 없습니다",
    emptyDescription: "회의명 또는 공개상태 필터를 변경하세요.",
    filters: [{ key: "status", label: "공개상태", options: ["전체", "공개", "비공개"] }, { key: "type", label: "회의", options: ["전체", "상임이사회", "분회장회의"] }],
    columns: baseColumns([{ key: "type", label: "회의", render: (item) => item.type }]),
    formFields: [...commonFormFields, { key: "meeting", label: "회의명" }]
  },
  press: {
    resource: "press",
    activeModule: "documents",
    activeMenu: "press",
    eyebrow: "문서",
    title: "보도자료",
    description: "보도자료 작성, 검토, 배포 상태를 관리합니다.",
    primaryAction: "보도자료 등록",
    destructiveAction: "보도자료 삭제",
    statusAction: "배포상태 변경",
    emptyTitle: "조건에 맞는 보도자료가 없습니다",
    emptyDescription: "배포상태 또는 유형 필터를 변경하세요.",
    filters: [{ key: "status", label: "배포상태", options: ["전체", "작성중", "검토중", "배포완료"] }, { key: "type", label: "유형", options: ["전체", "캠페인", "행사"] }],
    columns: baseColumns([{ key: "owner", label: "작성부서", render: (item) => item.owner }]),
    formFields: [...commonFormFields, { key: "releaseDate", label: "배포일", type: "date" }]
  },
  tickets: {
    resource: "tickets",
    activeModule: "tickets",
    activeMenu: "tickets",
    eyebrow: "업무",
    title: "민원·업무요청",
    description: "접수, 배정, 처리중, 보류, 완료 상태와 담당자, 우선순위를 관리합니다.",
    primaryAction: "업무요청 등록",
    destructiveAction: "요청 삭제",
    statusAction: "상태 변경",
    emptyTitle: "조건에 맞는 업무요청이 없습니다",
    emptyDescription: "담당자나 우선순위 검색어를 변경하세요.",
    filters: [branchFilter, { key: "status", label: "처리상태", options: ["전체", "접수", "담당자 배정", "처리중", "보류", "완료"] }, { key: "type", label: "유형", options: ["전체", "회원 문의", "회비 문의", "민원"] }],
    columns: baseColumns([{ key: "priority", label: "우선순위", render: (item) => item.fields.우선순위 }]),
    formFields: [...commonFormFields, { key: "requester", label: "요청자" }, { key: "dueDate", label: "처리기한", type: "date" }]
  },
  approvals: {
    resource: "approvals",
    activeModule: "approvals",
    activeMenu: "approvals",
    eyebrow: "업무",
    title: "결재함",
    description: "결재 대기, 진행, 완료 문서를 조회하고 승인/반려 mock 액션과 의견을 기록합니다.",
    primaryAction: "결재 의견 등록",
    destructiveAction: "반려",
    statusAction: "승인",
    emptyTitle: "조건에 맞는 결재 문서가 없습니다",
    emptyDescription: "결재상태 필터를 변경하세요.",
    filters: [{ key: "status", label: "결재상태", options: ["전체", "대기", "진행", "완료", "반려"] }, { key: "type", label: "문서유형", options: ["전체", "공문", "회의자료", "보도자료"] }],
    columns: baseColumns([{ key: "owner", label: "결재자", render: (item) => item.owner }]),
    formFields: [...commonFormFields, { key: "comment", label: "결재 의견" }]
  },
  events: {
    resource: "events",
    activeModule: "events",
    activeMenu: "events",
    eyebrow: "회의·행사",
    title: "회의·행사",
    description: "회의와 행사 일정을 캘린더형 목록으로 확인하고 참석 대상을 관리합니다.",
    primaryAction: "일정 등록",
    destructiveAction: "일정 삭제",
    statusAction: "참석대상 변경",
    emptyTitle: "조건에 맞는 일정이 없습니다",
    emptyDescription: "일정 상태나 유형 필터를 변경하세요.",
    filters: [{ key: "status", label: "상태", options: ["전체", "예정", "모집중", "완료"] }, { key: "type", label: "유형", options: ["전체", "회의", "행사"] }],
    columns: baseColumns([{ key: "date", label: "일정일", render: (item) => item.date }]),
    formFields: [...commonFormFields, { key: "date", label: "일정일", type: "date" }, { key: "place", label: "장소" }]
  },
  settings: {
    resource: "settings",
    activeModule: "settings",
    activeMenu: "settings",
    eyebrow: "설정",
    title: "설정",
    description: "사용자, 권한, 코드값, 알림 설정을 mock으로 관리하고 감사로그 확장 포인트를 확인합니다.",
    primaryAction: "설정 추가",
    destructiveAction: "설정 비활성",
    statusAction: "설정 적용",
    emptyTitle: "조건에 맞는 설정이 없습니다",
    emptyDescription: "설정 유형 필터를 변경하세요.",
    filters: [{ key: "status", label: "상태", options: ["전체", "활성", "비활성"] }, { key: "type", label: "유형", options: ["전체", "사용자", "권한", "코드값", "알림"] }],
    columns: baseColumns([{ key: "type", label: "유형", render: (item) => item.type }]),
    formFields: [...commonFormFields, { key: "target", label: "대상" }]
  }
};
