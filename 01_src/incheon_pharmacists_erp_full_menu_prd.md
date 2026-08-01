# 인천시약사회 ERP_v1 전체 메뉴 PRD

## 1. 목적

인천시약사회 ERP_v1은 사무국이 회원, 약국, 분회, 회비, 문서, 민원, 결재, 회의·행사 업무를 한 화면 체계에서 관리하기 위한 업무형 Admin Center다. 이번 버전은 운영 DB와 실제 인증을 연결하지 않는 Mock ERP v1이며, 전체 메뉴의 기능 흐름을 체험하고 화면 구조를 검증하는 것을 목표로 한다.

## 2. 구현 범위

- 좌측 Rail과 Module Sidebar 전체 메뉴를 라우팅한다.
- 모든 업무 화면은 목록 조회, 검색, 필터, 상세 보기, 등록, 수정, 삭제 또는 상태변경, 빈 상태를 제공한다.
- 데이터 변경은 클라이언트 상태에만 반영되며 새로고침 후 seed 데이터로 돌아간다.
- API는 REST-like mock endpoint로 제공한다.
- 실제 DB, 실제 로그인, 파일 업로드, 문자/메일 발송, 결재 알림 연동은 제외한다.

## 3. 메뉴 IA 및 라우팅

| 영역 | 메뉴 | Route |
| --- | --- | --- |
| 로그인 | Mock 로그인 | `/login` |
| 대시보드 | 홈 | `/dashboard` |
| 대시보드 | 오늘의 업무 | `/dashboard?view=today` |
| 회원 | 회원 관리 | `/members` |
| 회원 | 약국 관리 | `/pharmacies` |
| 회원 | 분회 관리 | `/members/branches` |
| 회원 | 임원·위원회 관리 | `/members/committees` |
| 회비 | 회비 현황 | `/dues` |
| 회비 | 입금 관리 | `/dues/payments` |
| 회비 | 미납자 관리 | `/dues/unpaid` |
| 문서 | 공문 관리 | `/documents` |
| 문서 | 회의자료 | `/documents/meetings` |
| 문서 | 보도자료 | `/documents/press` |
| 업무 | 민원·업무요청 | `/tickets` |
| 업무 | 결재함 | `/approvals` |
| 업무 | 회의·행사 | `/events` |
| 시스템 | 설정 | `/settings` |

## 4. 공통 UX

- 기존 `AdminLayout`, `IconRail`, `ModuleSidebar`를 모든 업무 화면에 재사용한다.
- 공통 화면 패턴은 `PageHeader`, `FilterBar`, `DataTable`, `StatusBadge`, `ActionToolbar`, `DetailDrawer`, `FormModal`, `ConfirmDialog`, `EmptyState` 성격을 가진 단일 CRUD workspace로 구성한다.
- 1024px 이상에서 좌측 Rail, Sidebar, 메인 컨텐츠가 겹치지 않아야 한다.
- 검색 결과가 0건이면 빈 상태 문구와 필터 초기화 액션을 제공한다.
- 삭제/상태변경/승인/발송 같은 액션은 mock 성공 메시지와 클라이언트 상태 변경으로 표현한다.

## 5. Mock API

### Endpoint

- `GET /api/{resource}`
- `GET /api/{resource}/{id}`
- `POST /api/{resource}`
- `PUT /api/{resource}/{id}`
- `DELETE /api/{resource}/{id}`

### Resource

`members`, `pharmacies`, `branches`, `committees`, `dues`, `payments`, `documents`, `meeting-docs`, `press`, `tickets`, `approvals`, `events`, `settings`, `audit-logs`

### Query

`q`, `status`, `branchId`, `year`, `type`, `page`, `pageSize`

### Response

- 목록: `{ items, total, page, pageSize }`
- 상세: `{ item }`
- 변경: `{ ok: true, item?, message }`

## 6. 메뉴별 요구사항

### 회원 관리

회원명, 면허번호, 분회, 회원상태로 조회한다. 회원 상세에서 연락처, 이메일, 가입일을 확인하고 등록/수정/탈퇴 처리 mock 액션을 수행한다.

### 약국 관리

약국명, 주소, 대표약사, 분회, 운영상태로 조회한다. 약국 상세에서 전화번호, 개설일, 주소 정보를 확인하고 등록/수정/폐업 처리 mock 액션을 수행한다.

### 분회 관리

분회 목록과 회원 수, 약국 수, 납부율, 분회장 정보를 제공한다. 분회 등록/수정과 분회장 변경 mock 액션을 제공한다.

### 임원·위원회 관리

직책, 위원회, 임기 상태로 임원 목록을 조회한다. 임원 등록/수정과 임기 종료 mock 액션을 제공한다.

### 회비 현황

연도, 분회, 납부상태로 회비 목록을 조회한다. 납부율과 금액 합계를 KPI로 표시하고 회원별 회비 등록/수정/취소 mock 액션을 제공한다.

### 입금 관리

입금자명, 분회, 매칭상태로 입금 내역을 조회한다. 입금 등록, 수정, 삭제, 미매칭 처리 mock 액션을 제공한다.

### 미납자 관리

미납 또는 부분납부 회원을 조회한다. 독촉 상태 변경과 안내 발송 mock 액션을 제공한다.

### 공문 관리

문서번호, 유형, 결재상태로 공문을 조회한다. 공문 등록/수정/삭제와 결재 요청 mock 액션을 제공한다.

### 회의자료

회의명, 공개상태로 자료 목록을 조회한다. 자료 등록/수정/삭제와 공개상태 변경 mock 액션을 제공한다.

### 보도자료

제목, 유형, 배포상태로 보도자료를 조회한다. 보도자료 등록/수정/삭제와 배포상태 변경 mock 액션을 제공한다.

### 민원·업무요청

접수, 담당자 배정, 처리중, 보류, 완료 상태를 관리한다. 담당자와 우선순위 검색을 지원하고 상태 변경 mock 액션을 제공한다.

### 결재함

결재 대기, 진행, 완료, 반려 상태를 조회한다. 승인/반려와 결재 의견 등록 mock 액션을 제공한다.

### 회의·행사

회의와 행사 일정을 목록형 캘린더로 제공한다. 일정 등록/수정/삭제와 참석 대상 변경 mock 액션을 제공한다.

### 설정

사용자, 권한, 코드값, 알림 설정을 mock으로 관리한다. 향후 `SUPER_ADMIN`, `OFFICE_ADMIN`, `OFFICE_STAFF`, `EXECUTIVE`, `BRANCH_MANAGER` 권한과 감사로그 테이블로 확장한다.

### 로그인

로고와 제품명을 표시한다. Mock 로그인 버튼 클릭 시 `/dashboard`로 이동한다.

## 7. 권한 및 감사로그 확장 포인트

- 사용자 역할 타입은 `SUPER_ADMIN`, `OFFICE_ADMIN`, `OFFICE_STAFF`, `EXECUTIVE`, `BRANCH_MANAGER`를 기본 후보로 둔다.
- 모든 변경 API는 향후 `actorId`, `actorRole`, `entityType`, `entityId`, `metadata`, `createdAt` 형태의 감사로그로 확장한다.
- Mock v1에서는 실제 권한 차단 없이 화면 체험을 우선한다.

## 8. 검증 기준

- `npm run lint`와 `npm run build`가 통과해야 한다.
- 주요 mock API의 목록/상세/변경 응답 shape가 일관되어야 한다.
- 모든 Rail/Sidebar 링크가 404 없이 열려야 한다.
- 각 업무 화면에서 검색, 필터, 상세, 등록/수정 modal, 삭제 confirm, 상태변경이 동작해야 한다.
- 1440px와 1024px 폭에서 텍스트 겹침과 의도치 않은 가로 overflow가 없어야 한다.
