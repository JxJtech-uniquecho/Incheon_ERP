# 인천시약사회 사무국 ERP - 홈 대시보드 PRD v0.2

> 목적: Codex가 바로 개발 작업을 이해하고 구현할 수 있도록 작성한 Markdown 기반 PRD입니다.  
> 범위: 로그인 이후 첫 화면인 **Admin Center 스타일 홈 대시보드** 구현.  
> 기준 화면: 약매니저 Admin Center 스타일의 3단 관리자 대시보드 구조.

---

## 0. 개발 목표 요약

인천시약사회 사무국 ERP의 로그인 이후 첫 화면을 **업무 관제센터형 대시보드**로 구현한다.

이 화면은 사무국 직원, 사무국장, 회장단, 임원, 분회장 등이 다음 정보를 한눈에 확인할 수 있도록 한다.

- 전체 회원 현황
- 약국 현황
- 회비 납부 현황
- 미처리 민원 및 업무요청
- 결재 대기 문서
- 예정 회의 및 행사
- 최근 등록 문서
- 담당자별 업무 처리 현황
- AI 업무 요약

---

## 1. 제품 정보

### 1.1 제품명

인천시약사회 사무국 업무지원 ERP

### 1.2 이번 개발 범위

`/dashboard` 화면 구현

### 1.3 화면 컨셉

- 밝고 정돈된 Apple-style Admin Dashboard
- 약매니저 Admin Center와 유사한 3단 레이아웃
- 과도한 그림자, 강한 색상, 복잡한 그래픽은 지양
- 정보 밀도는 높지만 시각적으로 깔끔해야 함
- 사무국 직원이 엑셀 없이도 업무 현황을 바로 파악할 수 있어야 함

---

## 2. 전체 화면 구조

### 2.1 App Shell Layout

```text
┌──────────────┬────────────────────────┬────────────────────────────────────┐
│ Icon Rail    │ Module Sidebar          │ Main Dashboard                     │
│ 64px         │ 300px                   │ Flexible                           │
└──────────────┴────────────────────────┴────────────────────────────────────┘
```

### 2.2 영역별 역할

| 영역 | 역할 | 너비 |
|---|---|---:|
| Icon Rail | ERP 주요 모듈 전환 | 64px |
| Module Sidebar | 선택된 모듈의 하위 메뉴 표시 | 300px |
| Main Dashboard | KPI, AI 요약, 차트, 테이블 표시 | flexible |

### 2.3 기본 라우팅

```text
/login      로그인 화면
/dashboard  로그인 후 홈 대시보드
/members    회원 관리
/pharmacies 약국 관리
/dues       회비 관리
/documents  문서 관리
/events     회의·행사 관리
/tickets    민원·업무요청 관리
/approvals  결재함
/settings   시스템 설정
```

로그인 성공 시 기본 이동 경로는 `/dashboard`이다.

---

## 3. 디자인 시스템

### 3.1 CSS Design Token

아래 CSS 변수를 전역 스타일에 적용한다.

```css
:root {
  --color-bg: #F5F7FA;
  --color-surface: #FFFFFF;
  --color-surface-muted: #F8FAFC;

  --color-border: #E5EAF0;
  --color-border-soft: #EEF2F6;

  --color-text-primary: #111827;
  --color-text-secondary: #667085;
  --color-text-muted: #98A2B3;

  --color-primary: #10B981;
  --color-primary-dark: #059669;
  --color-primary-soft: #EAFBF3;

  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-info: #3B82F6;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;

  --shadow-card: 0 1px 2px rgba(16, 24, 40, 0.04);
  --shadow-floating: 0 8px 24px rgba(16, 24, 40, 0.08);

  --rail-width: 64px;
  --sidebar-width: 300px;
  --content-padding: 32px;
}
```

### 3.2 전체 스타일 기준

| 항목 | 값 |
|---|---|
| 전체 배경 | `#F5F7FA` |
| 카드 배경 | `#FFFFFF` |
| 기본 테두리 | `1px solid #E5EAF0` |
| 카드 Radius | `16px` |
| 주요 포인트 컬러 | `#10B981` |
| 메인 텍스트 | `#111827` |
| 보조 텍스트 | `#667085` |
| 흐린 텍스트 | `#98A2B3` |
| 카드 그림자 | 최소 사용 |
| 기본 폰트 | system font 또는 Pretendard |

---

## 4. 레이아웃 컴포넌트

## 4.1 `AdminLayout`

### 역할

관리자 화면 전체 공통 레이아웃.

### 포함 컴포넌트

- `IconRail`
- `ModuleSidebar`
- `MainContent`
- `TopUserMenu` 선택 적용

### TypeScript Props

```ts
type AdminLayoutProps = {
  children: React.ReactNode;
  activeModule: string;
  activeMenu: string;
};
```

### 스타일 요구사항

- 전체 높이: `100vh`
- 전체 배경: `var(--color-bg)`
- 좌측 `IconRail` 고정
- 좌측 `ModuleSidebar` 고정
- 우측 `MainContent` 스크롤 가능

---

## 4.2 `IconRail`

### 역할

ERP의 주요 모듈을 전환하는 최좌측 아이콘 메뉴.

### 메뉴 구성

| 메뉴명 | 라우트 | 설명 |
|---|---|---|
| 홈 | `/dashboard` | 홈 대시보드 |
| 회원 | `/members` | 회원·약국 관리 |
| 회비 | `/dues` | 회비·입금 관리 |
| 문서 | `/documents` | 공문·문서 관리 |
| 회의 | `/events` | 회의·행사 관리 |
| 민원 | `/tickets` | 업무요청·민원 관리 |
| 결재 | `/approvals` | 결재함 |
| 설정 | `/settings` | 시스템 관리 |

### UI 요구사항

- 너비: `64px`
- 배경: `#FFFFFF`
- 우측 border: `1px solid #E5EAF0`
- 아이콘 크기: `22px`
- 메뉴 간격: `24px`
- 활성 메뉴 배경: `#F0FDF4`
- 활성 메뉴 아이콘 색상: `#10B981`
- 비활성 메뉴 아이콘 색상: `#98A2B3`
- 하단에는 로그아웃 또는 사용자 메뉴 배치

### 활성 메뉴 예시

```tsx
<IconRail activeModule="dashboard" />
```

---

## 4.3 `ModuleSidebar`

### 역할

현재 선택된 모듈의 하위 메뉴를 표시한다.

### 홈 대시보드 선택 시 표시 메뉴

```text
인천시약사회
Admin Center

대시보드
- 홈
- 오늘의 업무
- 미처리 업무

회원
- 회원 관리
- 약국 관리
- 분회 관리
- 임원·위원회 관리

회비
- 회비 현황
- 입금 관리
- 미납자 관리

문서
- 공문 관리
- 회의자료
- 보도자료

업무
- 민원·업무요청
- 결재함
```

### UI 요구사항

- 너비: `300px`
- 배경: `#FFFFFF`
- 로고 영역 포함
- 시스템명: `인천시약사회 Admin Center`
- 메뉴 그룹 라벨 사용
- 활성 메뉴 배경: `#F0F2F5`
- 활성 메뉴 텍스트 색상: `#111827`
- 활성 메뉴 아이콘 색상: `#10B981`
- 활성 메뉴 radius: `10px`
- 비활성 메뉴 텍스트 색상: `#667085`
- hover 배경: `#F8FAFC`

---

## 5. Dashboard Main 화면 구성

## 5.1 화면 상단 기간 필터

### 목적

대시보드 지표를 기간 기준으로 조회한다.

### 필터 옵션

| 옵션 | 값 |
|---|---|
| 일간 | `day` |
| 주간 | `week` |
| 당월 | `month` |
| 커스텀 | `custom` |

기본 선택값은 `month`이다.

### 커스텀 기간 입력

`custom` 선택 시 다음 입력 필드를 표시한다.

- 시작일
- 종료일
- 적용 버튼
- 초기화 버튼

### CSS 예시

```css
.period-tabs {
  display: inline-flex;
  padding: 4px;
  background: #EEF2F6;
  border-radius: 10px;
}

.period-tab {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  color: #667085;
}

.period-tab.active {
  background: #FFFFFF;
  color: #111827;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.06);
}
```

---

## 5.2 KPI 카드 영역

### 카드 배치

데스크톱 기준 5개 카드를 가로 배치한다.

```text
[전체 회원 수] [정상 약국 수] [회비 납부율] [미처리 업무] [결재 대기]
```

### KPI 카드 목록

| 카드명 | 데이터 키 | 설명 |
|---|---|---|
| 전체 회원 수 | `totalMembers` | 등록된 전체 회원 수 |
| 정상 약국 수 | `activePharmacies` | 정상 운영 중인 약국 수 |
| 회비 납부율 | `duesPaymentRate` | 당해연도 회비 납부율 |
| 미처리 업무 | `unresolvedTickets` | 완료되지 않은 업무요청 수 |
| 결재 대기 | `pendingApprovals` | 승인 대기 문서 수 |

### 카드 표시 예시

```text
전체 회원 수
3,214명
↑ 전월 대비 +12명
```

```text
회비 납부율
78.4%
미납 693명
```

```text
미처리 업무
24건
긴급 3건
```

### UI 요구사항

- 카드 높이: `128px`
- 카드 배경: `#FFFFFF`
- border: `1px solid #E5EAF0`
- border-radius: `16px`
- padding: `20px`
- 제목: `13px`, 보조 색상
- 숫자: `26px`, bold
- 보조 텍스트: `12px`
- 상승/정상 색상: `#10B981`
- 경고 색상: `#F59E0B`
- 위험 색상: `#EF4444`

---

## 5.3 AI 업무 요약 카드

### 목적

현재 기간 기준 사무국의 주요 업무 현황을 자연어로 요약한다.

### 제목

`AI 요약`

### 표시 예시

```text
AI 요약

이번 달 신규 회원은 12명 증가했고, 정상 약국은 1,248개소입니다.
2026년도 회비 납부율은 78.4%이며, 미납 회원은 693명입니다.
현재 미처리 업무요청은 24건이며, 이 중 긴급 민원은 3건입니다.
결재 대기 문서는 8건이며, 이번 주 예정된 회의·행사는 4건입니다.
```

### 생성 기준 데이터

- 회원 증감
- 약국 증감
- 회비 납부율
- 미납 회원 수
- 미처리 티켓 수
- 긴급 티켓 수
- 결재 대기 수
- 예정 행사 수
- 최근 주요 문서

### UI 요구사항

- 배경: `#EAFBF3`
- border: `1px solid #CFF5E3`
- 아이콘: sparkle 또는 bot icon
- 제목 색상: `#059669`
- 본문 색상: `#374151`
- border-radius: `16px`
- padding: `24px`
- line-height: `1.8`

---

## 5.4 차트 영역

차트 영역은 대시보드 중단에 배치한다.

```text
┌─────────────────────────────────────────────┬──────────────────────────────┐
│ 회비 납부 추이                              │ 담당자별 업무 처리 현황      │
│ Line Chart                                  │ Staff Performance Card       │
└─────────────────────────────────────────────┴──────────────────────────────┘
```

---

## 5.4.1 회비 납부 추이 차트

### 카드 제목

`회비 납부 추이`

### 차트 유형

Line Chart

### 표시 데이터

- 일자별 납부 건수
- 일자별 납부 금액
- 누적 납부율
- 전년도 동일 기간 비교

### 탭

| 탭 | 값 |
|---|---|
| 일별 | `daily` |
| 누적 | `cumulative` |

### 범례

- 당월
- 전월
- 전년도

### UI 요구사항

- 좌측 대형 카드
- grid line은 연한 회색
- 비교선은 점선 사용 가능
- tooltip 제공
- 데이터가 없으면 `표시할 회비 납부 데이터가 없습니다.` 표시

---

## 5.4.2 담당자별 업무 처리 현황

### 카드 제목

`담당자별 업무 처리 현황`

### 표시 항목

| 담당자 | 처리 완료 | 처리중 | 지연 | 목표 |
|---|---:|---:|---:|---:|
| 사무국장 | 18건 | 4건 | 1건 | 30건 |
| 직원 A | 25건 | 6건 | 0건 | 40건 |
| 직원 B | 12건 | 8건 | 2건 | 30건 |

### UI 요구사항

- 우측 카드 형태
- 담당자별 row 카드
- 완료 건수는 bold
- 지연 건수는 `#EF4444`
- 목표 미설정 시 `목표 미설정` 표시
- row 클릭 시 해당 담당자의 티켓 목록으로 이동

---

## 5.5 하단 상세 영역

하단에는 다음 3개 영역을 배치한다.

1. 분회별 회원·회비 현황
2. 최근 업무요청
3. 최근 문서

---

## 5.5.1 분회별 회원·회비 현황

### 테이블 컬럼

| 컬럼 | 데이터 키 |
|---|---|
| 분회 | `branchName` |
| 회원 수 | `memberCount` |
| 정상 약국 | `pharmacyCount` |
| 납부율 | `paymentRate` |
| 미납 | `unpaidCount` |

### 예시

| 분회 | 회원 수 | 정상 약국 | 납부율 | 미납 |
|---|---:|---:|---:|---:|
| 남동구 | 412명 | 188개소 | 81.2% | 77명 |
| 부평구 | 386명 | 172개소 | 76.5% | 91명 |
| 미추홀구 | 334명 | 150개소 | 79.1% | 70명 |

---

## 5.5.2 최근 업무요청

### 테이블 컬럼

| 컬럼 | 데이터 키 |
|---|---|
| 접수일 | `createdAt` |
| 유형 | `ticketType` |
| 요청자 | `requesterName` |
| 제목 | `title` |
| 담당자 | `assignedUserName` |
| 상태 | `status` |
| 우선순위 | `priority` |

### 상태값

- 접수
- 담당자 배정
- 처리중
- 보류
- 완료
- 종료

### 우선순위

- 긴급
- 높음
- 보통
- 낮음

---

## 5.5.3 최근 문서

### 테이블 컬럼

| 컬럼 | 데이터 키 |
|---|---|
| 등록일 | `createdAt` |
| 문서번호 | `documentNo` |
| 문서유형 | `documentType` |
| 제목 | `title` |
| 작성자 | `authorName` |
| 결재상태 | `approvalStatus` |

### 문서 유형

- 수신 공문
- 발신 공문
- 회의자료
- 정책자료
- 행사자료
- 보도자료
- 내부보고
- 기타 문서

---

## 6. 권한별 데이터 표시 기준

## 6.1 `SUPER_ADMIN`, `OFFICE_ADMIN`

전체 데이터 표시.

- 전체 회원 수
- 전체 약국 수
- 전체 회비 납부율
- 전체 민원·업무요청
- 전체 결재 현황
- 전체 분회별 통계

## 6.2 `OFFICE_STAFF`

본인 담당 업무 중심 표시.

- 전체 회원·약국 기본 통계
- 본인 담당 티켓
- 본인 작성 문서
- 본인 결재 요청 문서
- 예정 행사

## 6.3 `EXECUTIVE`

보고용 대시보드 표시.

- 전체 회원 현황
- 회비 납부율
- 주요 미처리 업무 수
- 주요 행사 일정
- 결재 대기 문서
- 분회별 주요 통계

## 6.4 `BRANCH_MANAGER`

소속 분회 기준으로 제한 표시.

- 해당 분회 회원 수
- 해당 분회 약국 수
- 해당 분회 회비 납부율
- 해당 분회 미납 회원 수
- 해당 분회 관련 민원·업무요청

---

## 7. 컴포넌트 설계

## 7.1 `MetricCard`

### 역할

상단 KPI 카드.

### Props

```ts
type MetricCardProps = {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    type: "up" | "down" | "neutral";
    label: string;
  };
};
```

### 사용 예시

```tsx
<MetricCard
  title="전체 회원 수"
  value="3,214명"
  description="전월 대비 +12명"
  trend={{ type: "up", label: "+0.4%" }}
/>
```

---

## 7.2 `AISummaryCard`

### 역할

AI 요약 문장 표시.

### Props

```ts
type AISummaryCardProps = {
  summaryLines: string[];
  generatedAt?: string;
};
```

### 요구사항

- 제목은 `AI 요약`
- 아이콘 표시
- 문장 단위 줄바꿈
- 업데이트 시간 표시 가능

---

## 7.3 `DashboardChartCard`

### 역할

차트 카드 공통 wrapper.

### Props

```ts
type DashboardChartCardProps = {
  title: string;
  tabs?: string[];
  activeTab?: string;
  children: React.ReactNode;
};
```

---

## 7.4 `StaffPerformanceCard`

### 역할

담당자별 업무 처리 현황 표시.

### Types

```ts
type StaffPerformance = {
  staffName: string;
  completedCount: number;
  processingCount: number;
  delayedCount: number;
  targetCount?: number;
};

type StaffPerformanceCardProps = {
  items: StaffPerformance[];
};
```

---

## 7.5 `BranchStatsTable`

### 역할

분회별 회원·회비 현황 테이블.

### Types

```ts
type BranchStat = {
  branchName: string;
  memberCount: number;
  pharmacyCount: number;
  paymentRate: number;
  unpaidCount: number;
};

type BranchStatsTableProps = {
  items: BranchStat[];
};
```

---

## 7.6 `RecentTicketsTable`

### 역할

최근 업무요청 목록.

### Types

```ts
type RecentTicket = {
  id: string;
  createdAt: string;
  ticketType: string;
  requesterName: string;
  title: string;
  assignedUserName: string;
  status: string;
  priority: "긴급" | "높음" | "보통" | "낮음";
};

type RecentTicketsTableProps = {
  items: RecentTicket[];
};
```

---

## 7.7 `RecentDocumentsTable`

### 역할

최근 등록 문서 목록.

### Types

```ts
type RecentDocument = {
  id: string;
  createdAt: string;
  documentNo: string;
  documentType: string;
  title: string;
  authorName: string;
  approvalStatus: string;
};

type RecentDocumentsTableProps = {
  items: RecentDocument[];
};
```

---

## 8. API 설계

## 8.1 Dashboard Summary API

### Endpoint

```http
GET /api/dashboard/summary
```

### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| period | `day \| week \| month \| custom` | Y | 조회 기간 |
| startDate | `YYYY-MM-DD` | N | custom 시작일 |
| endDate | `YYYY-MM-DD` | N | custom 종료일 |
| branchId | string | N | 분회 필터 |
| staffId | string | N | 담당자 필터 |

### Request 예시

```http
GET /api/dashboard/summary?period=month
```

### Response 예시

```json
{
  "period": "month",
  "metrics": {
    "totalMembers": 3214,
    "activePharmacies": 1248,
    "duesPaymentRate": 78.4,
    "unresolvedTickets": 24,
    "pendingApprovals": 8,
    "unpaidMembers": 693,
    "urgentTickets": 3,
    "upcomingEvents": 4
  },
  "metricTrends": {
    "totalMembers": {
      "type": "up",
      "label": "전월 대비 +12명"
    },
    "activePharmacies": {
      "type": "neutral",
      "label": "전월과 동일"
    },
    "duesPaymentRate": {
      "type": "up",
      "label": "전월 대비 +4.2%p"
    },
    "unresolvedTickets": {
      "type": "down",
      "label": "전주 대비 -6건"
    },
    "pendingApprovals": {
      "type": "neutral",
      "label": "확인 필요"
    }
  },
  "aiSummary": [
    "이번 달 신규 회원은 12명 증가했고, 정상 약국은 1,248개소입니다.",
    "2026년도 회비 납부율은 78.4%이며, 미납 회원은 693명입니다.",
    "현재 미처리 업무요청은 24건이며, 이 중 긴급 민원은 3건입니다.",
    "결재 대기 문서는 8건이며, 이번 주 예정된 회의·행사는 4건입니다."
  ],
  "duesChart": [
    {
      "date": "2026-07-01",
      "paidAmount": 3200000,
      "paidCount": 18,
      "cumulativeRate": 72.1
    }
  ],
  "staffPerformance": [
    {
      "staffName": "사무국장",
      "completedCount": 18,
      "processingCount": 4,
      "delayedCount": 1,
      "targetCount": 30
    },
    {
      "staffName": "직원 A",
      "completedCount": 25,
      "processingCount": 6,
      "delayedCount": 0,
      "targetCount": 40
    }
  ],
  "branchStats": [
    {
      "branchName": "남동구",
      "memberCount": 412,
      "pharmacyCount": 188,
      "paymentRate": 81.2,
      "unpaidCount": 77
    }
  ],
  "recentTickets": [
    {
      "id": "ticket_001",
      "createdAt": "2026-07-01",
      "ticketType": "회원 문의",
      "requesterName": "홍길동",
      "title": "약국 주소 변경 요청",
      "assignedUserName": "직원 A",
      "status": "처리중",
      "priority": "보통"
    }
  ],
  "recentDocuments": [
    {
      "id": "doc_001",
      "createdAt": "2026-07-01",
      "documentNo": "IPA-2026-공문-0001",
      "documentType": "발신 공문",
      "title": "정책토론회 개최 안내",
      "authorName": "사무국장",
      "approvalStatus": "승인 완료"
    }
  ]
}
```

---

## 9. Mock Data 개발 기준

초기 개발 단계에서는 실제 API 없이 mock data로 화면을 구성한다.

### 파일 구조 예시

```text
src/
  app/
    dashboard/
      page.tsx
  components/
    layout/
      AdminLayout.tsx
      IconRail.tsx
      ModuleSidebar.tsx
    dashboard/
      MetricCard.tsx
      AISummaryCard.tsx
      DashboardChartCard.tsx
      StaffPerformanceCard.tsx
      BranchStatsTable.tsx
      RecentTicketsTable.tsx
      RecentDocumentsTable.tsx
  lib/
    mock/
      dashboard.mock.ts
  types/
    dashboard.ts
```

### `dashboard.mock.ts` 예시

```ts
export const dashboardMock = {
  period: "month",
  metrics: {
    totalMembers: 3214,
    activePharmacies: 1248,
    duesPaymentRate: 78.4,
    unresolvedTickets: 24,
    pendingApprovals: 8,
    unpaidMembers: 693,
    urgentTickets: 3,
    upcomingEvents: 4,
  },
  aiSummary: [
    "이번 달 신규 회원은 12명 증가했고, 정상 약국은 1,248개소입니다.",
    "2026년도 회비 납부율은 78.4%이며, 미납 회원은 693명입니다.",
    "현재 미처리 업무요청은 24건이며, 이 중 긴급 민원은 3건입니다.",
    "결재 대기 문서는 8건이며, 이번 주 예정된 회의·행사는 4건입니다.",
  ],
};
```

---

## 10. 반응형 기준

### 10.1 데스크톱

기준: `1440px 이상`

- IconRail: 64px 고정
- ModuleSidebar: 300px 고정
- MainContent: flexible
- KPI 카드 5개 가로 배치
- 차트 영역은 좌측 2/3, 우측 1/3

### 10.2 태블릿

기준: `1024px ~ 1439px`

- KPI 카드 2열 또는 3열
- 차트 영역 세로 배치 가능
- ModuleSidebar는 유지

### 10.3 모바일

기준: `1024px 이하`

- MVP에서는 우선순위 낮음
- 기본적으로 데스크톱 업무용 ERP를 우선 구현
- 추후 모바일 대응은 Phase 2에서 별도 진행

---

## 11. 보안 및 감사로그 요구사항

### 11.1 개인정보 관련 액션 로그

다음 액션은 반드시 감사로그를 남겨야 한다.

- 회원정보 조회
- 회원정보 수정
- 약국정보 조회
- 약국정보 수정
- 회비정보 조회
- 회비정보 수정
- 개인정보 포함 엑셀 다운로드
- 문서 다운로드
- 권한 변경
- 결재 승인
- 결재 반려

### 11.2 감사로그 항목

```ts
type AuditLog = {
  id: string;
  userId: string;
  action: string;
  targetType: string;
  targetId: string;
  beforeValue?: unknown;
  afterValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
};
```

### 11.3 화면 권한 처리

- API 레벨에서 권한을 검증한다.
- 프론트엔드에서도 권한에 따라 메뉴를 숨긴다.
- 단, 프론트엔드 숨김은 보안 수단이 아니라 UX 보조 수단이다.

---

## 12. 개발 Task 목록

## Task 1. Admin Layout 구현

### 작업 내용

- `AdminLayout` 생성
- `IconRail` 생성
- `ModuleSidebar` 생성
- `MainContent` 영역 생성
- 전역 CSS 변수 적용

### 완료 기준

- `/dashboard` 접속 시 3단 레이아웃이 표시된다.
- 좌측 IconRail 너비는 64px이다.
- ModuleSidebar 너비는 300px이다.
- MainContent는 남은 영역을 모두 사용한다.

---

## Task 2. Dashboard Period Filter 구현

### 작업 내용

- 기간 필터 UI 구현
- 옵션: 일간, 주간, 당월, 커스텀
- 기본값: 당월
- 커스텀 선택 시 날짜 입력 UI 표시

### 완료 기준

- 기간 필터 클릭 시 active 상태가 변경된다.
- 기본값은 `당월`이다.
- custom 선택 시 시작일/종료일 입력이 표시된다.

---

## Task 3. KPI Metric Cards 구현

### 작업 내용

- `MetricCard` 컴포넌트 구현
- KPI 카드 5개 표시
- mock data 연결

### 완료 기준

다음 카드가 표시되어야 한다.

1. 전체 회원 수
2. 정상 약국 수
3. 회비 납부율
4. 미처리 업무
5. 결재 대기

---

## Task 4. AI Summary Card 구현

### 작업 내용

- `AISummaryCard` 컴포넌트 구현
- mock data의 `aiSummary` 배열 표시

### 완료 기준

- 연한 초록색 배경의 AI 요약 박스가 표시된다.
- 제목은 `AI 요약`이다.
- 3~5개의 요약 문장이 줄바꿈되어 표시된다.

---

## Task 5. Dues Chart 구현

### 작업 내용

- `DashboardChartCard` 구현
- `회비 납부 추이` 카드 구현
- Line Chart 추가
- mock chart data 연결

### 완료 기준

- 차트 카드 제목이 표시된다.
- 일별/누적 탭이 표시된다.
- 데이터가 없을 때 empty state가 표시된다.

---

## Task 6. Staff Performance Card 구현

### 작업 내용

- `StaffPerformanceCard` 구현
- 담당자별 row 표시
- 처리 완료, 처리중, 지연, 목표 표시

### 완료 기준

- 담당자별 업무 처리 현황이 표시된다.
- 지연 건수는 빨간색으로 표시된다.
- 목표가 없으면 `목표 미설정`으로 표시된다.

---

## Task 7. Bottom Tables 구현

### 작업 내용

- `BranchStatsTable` 구현
- `RecentTicketsTable` 구현
- `RecentDocumentsTable` 구현

### 완료 기준

- 분회별 회원·회비 현황이 표시된다.
- 최근 업무요청 목록이 표시된다.
- 최근 문서 목록이 표시된다.

---

## Task 8. API 연동 준비

### 작업 내용

- `types/dashboard.ts` 생성
- `GET /api/dashboard/summary` 응답 타입 정의
- mock data와 API response 타입 일치

### 완료 기준

- 추후 실제 API 연결 시 컴포넌트 수정 없이 data provider만 교체 가능해야 한다.

---

## 13. 완료 기준 Definition of Done

홈 대시보드는 다음 조건을 만족해야 완료로 본다.

- 로그인 후 `/dashboard`로 이동한다.
- 3단 Admin Layout이 구현되어 있다.
- 좌측 IconRail과 ModuleSidebar가 분리되어 있다.
- 상단 기간 필터가 표시되고 active 상태가 작동한다.
- KPI 카드 5개가 표시된다.
- AI 요약 박스가 표시된다.
- 회비 납부 추이 차트 카드가 표시된다.
- 담당자별 업무 처리 현황 카드가 표시된다.
- 분회별 통계 테이블이 표시된다.
- 최근 업무요청과 최근 문서 목록이 표시된다.
- 반응형 기준상 1024px 이상에서 깨지지 않는다.
- 색상, 여백, 카드 스타일이 디자인 토큰을 따른다.
- 개인정보 관련 조회·다운로드·수정 기능 확장 시 감사로그를 남길 수 있는 구조가 준비되어 있다.

---

## 14. Codex 실행용 프롬프트

아래 지시문을 Codex에 그대로 입력하여 개발을 시작한다.

```text
인천시약사회 사무국 ERP의 로그인 이후 홈 대시보드를 구현한다.

이 문서의 PRD를 기준으로 /dashboard 화면을 만든다.

핵심 요구사항:
1. 3단 Admin Layout을 구현한다.
   - IconRail: 64px
   - ModuleSidebar: 300px
   - MainContent: flexible

2. 디자인 토큰을 적용한다.
   - 배경: #F5F7FA
   - 카드 배경: #FFFFFF
   - 테두리: #E5EAF0
   - 포인트 컬러: #10B981
   - 카드 radius: 16px

3. 대시보드 구성 요소를 구현한다.
   - 기간 필터: 일간, 주간, 당월, 커스텀
   - KPI 카드 5개
   - AI 요약 카드
   - 회비 납부 추이 차트 카드
   - 담당자별 업무 처리 현황 카드
   - 분회별 회원·회비 현황 테이블
   - 최근 업무요청 테이블
   - 최근 문서 테이블

4. 컴포넌트를 분리한다.
   - AdminLayout
   - IconRail
   - ModuleSidebar
   - MetricCard
   - AISummaryCard
   - DashboardChartCard
   - StaffPerformanceCard
   - BranchStatsTable
   - RecentTicketsTable
   - RecentDocumentsTable

5. 우선 mock data로 구현한다.
   - src/lib/mock/dashboard.mock.ts
   - src/types/dashboard.ts

6. 추후 GET /api/dashboard/summary API와 연결하기 쉽도록 타입을 분리한다.

7. 반응형은 1440px 이상 데스크톱을 우선 최적화하고, 1024px 이상에서 깨지지 않도록 한다.

8. 전체 디자인은 밝고 정돈된 Apple-style Admin Dashboard로 구현한다.
   과도한 그림자, 강한 색상, 복잡한 그래픽 사용은 피한다.
```

---

## 15. 구현 시 주의사항

- 현재 단계에서는 실제 API가 없어도 된다.
- mock data 기반으로 화면 완성도를 먼저 확보한다.
- 컴포넌트 단위로 분리하여 이후 기능 확장에 유리하게 만든다.
- 회원정보, 약국정보, 회비정보는 개인정보에 해당할 수 있으므로 추후 실제 API 연결 시 권한 검증과 감사로그가 반드시 필요하다.
- 사무국 ERP는 모바일보다 데스크톱 사용성이 더 중요하다.
- UI는 경영진 보고용 화면처럼 깔끔해야 하지만, 실제 사무국 직원이 매일 쓰기 편한 업무형 구조를 우선한다.

