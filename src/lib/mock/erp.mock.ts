import type { ErpListResponse, ErpMutationResponse, ErpRecord, ErpResource } from "@/types/erp";

const branches = [
  { id: "branch_namdong", name: "남동구" },
  { id: "branch_bupyeong", name: "부평구" },
  { id: "branch_michuhol", name: "미추홀구" },
  { id: "branch_yeonsu", name: "연수구" },
  { id: "branch_seo", name: "서구" }
];

export const erpMockData: Record<ErpResource, ErpRecord[]> = {
  members: [
    { id: "mem_001", title: "김민정", subtitle: "면허 215438 / 민정약국", status: "정상", branchId: "branch_namdong", branchName: "남동구", type: "개국", owner: "직원 A", updatedAt: "2026-07-01", fields: { 면허번호: "215438", 휴대전화: "010-3481-2109", 이메일: "mj.kim@example.com", 가입일: "2019-03-12" } },
    { id: "mem_002", title: "이준호", subtitle: "면허 198044 / 인하온누리약국", status: "휴면", branchId: "branch_michuhol", branchName: "미추홀구", type: "근무", owner: "직원 B", updatedAt: "2026-06-28", fields: { 면허번호: "198044", 휴대전화: "010-7712-0901", 이메일: "jh.lee@example.com", 가입일: "2015-09-02" } },
    { id: "mem_003", title: "박서연", subtitle: "면허 239882 / 송도중앙약국", status: "정상", branchId: "branch_yeonsu", branchName: "연수구", type: "개국", owner: "직원 C", updatedAt: "2026-06-25", fields: { 면허번호: "239882", 휴대전화: "010-5520-1184", 이메일: "sy.park@example.com", 가입일: "2021-01-18" } },
    { id: "mem_004", title: "최도윤", subtitle: "면허 176002 / 부평메디팜", status: "탈퇴처리", branchId: "branch_bupyeong", branchName: "부평구", type: "개국", owner: "사무국장", updatedAt: "2026-06-20", fields: { 면허번호: "176002", 휴대전화: "010-6011-4002", 이메일: "dy.choi@example.com", 가입일: "2012-05-22" } }
  ],
  pharmacies: [
    { id: "pha_001", title: "민정약국", subtitle: "인천 남동구 예술로 128", status: "운영", branchId: "branch_namdong", branchName: "남동구", type: "동네약국", owner: "김민정", updatedAt: "2026-07-01", fields: { 대표약사: "김민정", 전화번호: "032-431-2109", 개설일: "2019-05-01", 우편번호: "21573" } },
    { id: "pha_002", title: "인하온누리약국", subtitle: "인천 미추홀구 인하로 100", status: "운영", branchId: "branch_michuhol", branchName: "미추홀구", type: "문전약국", owner: "이준호", updatedAt: "2026-06-28", fields: { 대표약사: "이준호", 전화번호: "032-872-1004", 개설일: "2017-10-10", 우편번호: "22212" } },
    { id: "pha_003", title: "송도중앙약국", subtitle: "인천 연수구 컨벤시아대로 165", status: "운영", branchId: "branch_yeonsu", branchName: "연수구", type: "동네약국", owner: "박서연", updatedAt: "2026-06-25", fields: { 대표약사: "박서연", 전화번호: "032-831-4455", 개설일: "2021-03-01", 우편번호: "21998" } },
    { id: "pha_004", title: "부평메디팜", subtitle: "인천 부평구 부평대로 52", status: "폐업", branchId: "branch_bupyeong", branchName: "부평구", type: "문전약국", owner: "최도윤", updatedAt: "2026-06-14", fields: { 대표약사: "최도윤", 전화번호: "032-501-6620", 개설일: "2014-08-11", 우편번호: "21388" } }
  ],
  branches: branches.map((branch, index) => ({
    id: branch.id,
    title: branch.name,
    subtitle: `회원 ${[412, 386, 334, 298, 366][index].toLocaleString()}명 / 약국 ${[188, 172, 150, 138, 160][index]}개소`,
    status: "운영",
    branchId: branch.id,
    branchName: branch.name,
    owner: ["정하늘", "오세훈", "문지영", "강민수", "한유리"][index],
    updatedAt: "2026-06-30",
    fields: { 분회장: ["정하늘", "오세훈", "문지영", "강민수", "한유리"][index], 회원수: [412, 386, 334, 298, 366][index], 약국수: [188, 172, 150, 138, 160][index], 납부율: `${[81.2, 76.5, 79.1, 82.0, 74.8][index]}%` }
  })),
  committees: [
    { id: "com_001", title: "정하늘", subtitle: "회장 / 제34대 집행부", status: "임기중", type: "회장단", owner: "총무팀", updatedAt: "2026-07-01", fields: { 직책: "회장", 위원회: "회장단", 임기: "2025-2027", 연락처: "010-3000-1000" } },
    { id: "com_002", title: "문지영", subtitle: "학술위원장 / 학술위원회", status: "임기중", type: "위원회", owner: "총무팀", updatedAt: "2026-06-21", fields: { 직책: "위원장", 위원회: "학술위원회", 임기: "2025-2027", 연락처: "010-3000-2000" } },
    { id: "com_003", title: "강민수", subtitle: "전 부회장 / 자문", status: "임기종료", type: "자문", owner: "사무국장", updatedAt: "2026-05-30", fields: { 직책: "자문위원", 위원회: "자문", 임기: "2022-2024", 연락처: "010-3000-3000" } }
  ],
  dues: [
    { id: "due_001", title: "김민정 2026 회비", subtitle: "정회원 / 남동구", status: "납부완료", branchId: "branch_namdong", branchName: "남동구", year: 2026, amount: 300000, date: "2026-07-01", fields: { 회원명: "김민정", 회비구분: "정회원", 납부금액: 300000, 납부일: "2026-07-01" } },
    { id: "due_002", title: "이준호 2026 회비", subtitle: "정회원 / 미추홀구", status: "부분납부", branchId: "branch_michuhol", branchName: "미추홀구", year: 2026, amount: 150000, date: "2026-06-18", fields: { 회원명: "이준호", 회비구분: "정회원", 납부금액: 150000, 미납금액: 150000 } },
    { id: "due_003", title: "박서연 2026 회비", subtitle: "정회원 / 연수구", status: "미납", branchId: "branch_yeonsu", branchName: "연수구", year: 2026, amount: 0, fields: { 회원명: "박서연", 회비구분: "정회원", 납부금액: 0, 미납금액: 300000 } }
  ],
  payments: [
    { id: "pay_001", title: "김민정 입금", subtitle: "신한 110-123 / 300,000원", status: "매칭완료", branchId: "branch_namdong", branchName: "남동구", amount: 300000, date: "2026-07-01", fields: { 입금자: "김민정", 계좌: "신한 110-123", 매칭회원: "김민정", 처리자: "직원 A" } },
    { id: "pay_002", title: "연수분회 일괄입금", subtitle: "국민 004-01 / 1,200,000원", status: "미매칭", branchId: "branch_yeonsu", branchName: "연수구", amount: 1200000, date: "2026-06-29", fields: { 입금자: "연수분회", 계좌: "국민 004-01", 매칭회원: "-", 처리자: "직원 B" } }
  ],
  documents: [
    { id: "doc_001", title: "정책토론회 개최 안내", subtitle: "IPA-2026-공문-0001", status: "승인 완료", type: "발신 공문", owner: "사무국장", date: "2026-07-01", fields: { 문서번호: "IPA-2026-공문-0001", 유형: "발신 공문", 작성자: "사무국장", 수신처: "전체 회원" } },
    { id: "doc_002", title: "약국 개인정보보호 점검 안내", subtitle: "IPA-2026-공문-0002", status: "결재 대기", type: "수신 공문", owner: "직원 A", date: "2026-06-30", fields: { 문서번호: "IPA-2026-공문-0002", 유형: "수신 공문", 작성자: "직원 A", 수신처: "분회장" } }
  ],
  "meeting-docs": [
    { id: "meetdoc_001", title: "7월 상임이사회 회의자료", subtitle: "상임이사회 / PDF 18p", status: "공개", type: "상임이사회", owner: "직원 A", date: "2026-07-05", fields: { 회의명: "7월 상임이사회", 자료구분: "회의자료", 공개범위: "임원", 첨부: "mock-file.pdf" } },
    { id: "meetdoc_002", title: "분회장 회의 안건", subtitle: "분회장회의 / DOCX", status: "비공개", type: "분회장회의", owner: "사무국장", date: "2026-06-28", fields: { 회의명: "분회장 회의", 자료구분: "안건", 공개범위: "사무국", 첨부: "mock-agenda.docx" } }
  ],
  press: [
    { id: "press_001", title: "지역사회 의약품 안전 캠페인", subtitle: "배포처 12곳", status: "배포완료", type: "캠페인", owner: "홍보팀", date: "2026-06-28", fields: { 배포일: "2026-06-28", 배포처: "지역 언론 12곳", 작성자: "직원 B", 승인자: "사무국장" } },
    { id: "press_002", title: "인천시약사회 정기총회 개최", subtitle: "초안 검토중", status: "작성중", type: "행사", owner: "홍보팀", date: "2026-07-03", fields: { 배포일: "예정", 배포처: "지역 언론", 작성자: "직원 C", 승인자: "-" } }
  ],
  tickets: [
    { id: "ticket_001", title: "약국 주소 변경 요청", subtitle: "김민정 / 회원 문의", status: "처리중", branchId: "branch_namdong", branchName: "남동구", type: "회원 문의", owner: "직원 A", date: "2026-07-01", fields: { 요청자: "김민정", 우선순위: "보통", 담당자: "직원 A", 처리기한: "2026-07-03" } },
    { id: "ticket_002", title: "회비 납부 확인 요청", subtitle: "이준호 / 회비 문의", status: "접수", branchId: "branch_michuhol", branchName: "미추홀구", type: "회비 문의", owner: "직원 B", date: "2026-07-01", fields: { 요청자: "이준호", 우선순위: "높음", 담당자: "직원 B", 처리기한: "2026-07-02" } },
    { id: "ticket_003", title: "긴급 약국 운영 민원 공유", subtitle: "박서연 / 민원", status: "보류", branchId: "branch_yeonsu", branchName: "연수구", type: "민원", owner: "사무국장", date: "2026-06-30", fields: { 요청자: "박서연", 우선순위: "긴급", 담당자: "사무국장", 처리기한: "2026-07-01" } }
  ],
  approvals: [
    { id: "apv_001", title: "정책토론회 개최 안내 결재", subtitle: "공문 / 사무국장", status: "대기", type: "공문", owner: "회장", date: "2026-07-01", fields: { 요청자: "사무국장", 결재선: "사무국장 > 회장", 의견: "검토 요청", 문서번호: "IPA-2026-공문-0001" } },
    { id: "apv_002", title: "7월 상임이사회 자료 공개", subtitle: "회의자료 / 직원 A", status: "진행", type: "회의자료", owner: "사무국장", date: "2026-06-30", fields: { 요청자: "직원 A", 결재선: "직원 A > 사무국장", 의견: "공개 승인 요청", 문서번호: "IPA-2026-회의-0014" } },
    { id: "apv_003", title: "보도자료 배포 승인", subtitle: "보도자료 / 홍보팀", status: "완료", type: "보도자료", owner: "회장", date: "2026-06-28", fields: { 요청자: "홍보팀", 결재선: "홍보팀 > 회장", 의견: "승인 완료", 문서번호: "IPA-2026-보도-0008" } }
  ],
  events: [
    { id: "evt_001", title: "7월 상임이사회", subtitle: "2026-07-05 19:00 / 회관 회의실", status: "예정", type: "회의", owner: "사무국장", date: "2026-07-05", fields: { 시작일시: "2026-07-05 19:00", 장소: "회관 회의실", 참석대상: "상임이사", 등록자: "직원 A" } },
    { id: "evt_002", title: "의약품 안전 캠페인", subtitle: "2026-07-12 10:00 / 인천시청 광장", status: "모집중", type: "행사", owner: "홍보팀", date: "2026-07-12", fields: { 시작일시: "2026-07-12 10:00", 장소: "인천시청 광장", 참석대상: "전체 회원", 등록자: "직원 B" } },
    { id: "evt_003", title: "분회장 정례회의", subtitle: "2026-06-24 / 완료", status: "완료", type: "회의", owner: "사무국장", date: "2026-06-24", fields: { 시작일시: "2026-06-24 18:30", 장소: "회관 회의실", 참석대상: "분회장", 등록자: "사무국장" } }
  ],
  settings: [
    { id: "set_001", title: "사용자 계정", subtitle: "사무국 사용자 8명", status: "활성", type: "사용자", owner: "SUPER_ADMIN", updatedAt: "2026-07-01", fields: { 권한: "OFFICE_ADMIN", 대상: "사무국", 설명: "사용자 초대와 비활성화 mock" } },
    { id: "set_002", title: "권한 그룹", subtitle: "5개 기본 역할", status: "활성", type: "권한", owner: "SUPER_ADMIN", updatedAt: "2026-06-29", fields: { 권한: "SUPER_ADMIN, OFFICE_ADMIN, OFFICE_STAFF, EXECUTIVE, BRANCH_MANAGER", 대상: "전체", 설명: "실제 권한 제어 확장 포인트" } },
    { id: "set_003", title: "코드값 관리", subtitle: "회원상태, 결재상태, 분회 코드", status: "활성", type: "코드값", owner: "OFFICE_ADMIN", updatedAt: "2026-06-20", fields: { 권한: "OFFICE_ADMIN", 대상: "업무 코드", 설명: "운영 DB 연결 시 공통 코드 테이블 후보" } }
  ],
  "audit-logs": [
    { id: "audit_001", title: "김민정 회원 수정", subtitle: "직원 A / members", status: "기록됨", type: "UPDATE", owner: "직원 A", date: "2026-07-01", fields: { actorRole: "OFFICE_STAFF", entityType: "members", entityId: "mem_001", ip: "127.0.0.1" } }
  ]
};

export function listErpRecords(resource: ErpResource, params: URLSearchParams): ErpListResponse {
  const q = (params.get("q") ?? "").trim().toLowerCase();
  const status = params.get("status") ?? "전체";
  const branchId = params.get("branchId") ?? "전체";
  const year = params.get("year") ?? "전체";
  const type = params.get("type") ?? "전체";
  const page = Number(params.get("page") ?? "1");
  const pageSize = Number(params.get("pageSize") ?? "50");

  const filtered = (erpMockData[resource] ?? []).filter((item) => {
    const searchable = `${item.title} ${item.subtitle} ${item.status} ${item.branchName ?? ""} ${item.type ?? ""} ${item.owner ?? ""} ${Object.values(item.fields).join(" ")}`.toLowerCase();
    return (!q || searchable.includes(q)) && (status === "전체" || item.status === status) && (branchId === "전체" || item.branchId === branchId) && (year === "전체" || String(item.year) === year) && (type === "전체" || item.type === type);
  });

  const start = (page - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize
  };
}

export function getErpRecord(resource: ErpResource, id: string): ErpRecord | undefined {
  return erpMockData[resource]?.find((item) => item.id === id);
}

export function mutateErpRecord(resource: ErpResource, method: "POST" | "PUT" | "DELETE", id?: string, body?: Partial<ErpRecord>): ErpMutationResponse {
  const base = id ? getErpRecord(resource, id) : undefined;
  const item: ErpRecord = {
    id: id ?? `${resource}_${Date.now()}`,
    title: body?.title ?? base?.title ?? "새 항목",
    subtitle: body?.subtitle ?? base?.subtitle ?? "mock API로 생성됨",
    status: body?.status ?? base?.status ?? "등록",
    branchId: body?.branchId ?? base?.branchId,
    branchName: body?.branchName ?? base?.branchName,
    year: body?.year ?? base?.year,
    type: body?.type ?? base?.type,
    owner: body?.owner ?? base?.owner ?? "사무국",
    amount: body?.amount ?? base?.amount,
    date: body?.date ?? base?.date,
    updatedAt: "2026-07-01",
    fields: { ...(base?.fields ?? {}), ...(body?.fields ?? {}) }
  };

  if (method === "DELETE") {
    return { ok: true, item: base, message: "mock 삭제가 완료되었습니다." };
  }

  return { ok: true, item, message: method === "POST" ? "mock 등록이 완료되었습니다." : "mock 수정이 완료되었습니다." };
}

export const branchOptions = branches.map((branch) => ({ label: branch.name, value: branch.id }));
