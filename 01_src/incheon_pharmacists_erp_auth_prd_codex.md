# 인천시약사회 사무국 ERP 로그인 / 회원가입 PRD v0.1

> 목적: Codex가 바로 개발 작업을 수행할 수 있도록, 인천시약사회 사무국 ERP의 로그인, 세션 유지, 자동 로그아웃, 회원가입 화면 및 권한 구조를 명확하게 정의한다.  
> 디자인 기준: 기존 Admin Center 대시보드 CSS 테마를 유지한다.

---

## 1. 기능 개요

인천시약사회 사무국 ERP는 내부 업무용 시스템이므로, 로그인은 일반적인 공개 서비스 로그인보다 **권한 관리와 보안 통제**가 중요하다.

본 PRD의 범위는 다음과 같다.

1. 로그인 화면 설계
2. 회원가입 화면 설계
3. 권한 체계 설계
4. 세션 유지 및 30분 미사용 자동 로그아웃
5. 인증 API 설계
6. 사용자 DB 모델 설계
7. Codex 개발 작업 지시문

소셜 로그인은 사용하지 않는다.

---

## 2. 사용자 권한 체계

## 2-1. 권한 종류

ERP 사용자는 다음 3단계 권한으로 관리한다.

| 실제 직책 | 시스템 권한 | 권한 코드 | 설명 |
|---|---|---|---|
| 인천시약사회 회장 | 최고 관리자 | `master` | 전체 시스템, 전체 데이터, 사용자 승인 및 권한 관리 가능 |
| 인천시약사회 각 분회 회장 | 분회 관리자 | `submaster` | 본인 분회 데이터 조회 및 일부 관리 가능 |
| 인천시약사회 사무국장 | 사무국 관리자 | `submaster` | 사무국 실무 전체 관리 가능 |
| 인천시약사회 사무국 직원 | 일반 사용자 | `user` | 담당 업무 입력, 조회, 처리 가능 |

---

## 2-2. 권한별 접근 범위

| 기능 | master | submaster | user |
|---|---:|---:|---:|
| 전체 대시보드 조회 | 가능 | 제한 가능 | 제한 가능 |
| 전체 회원 조회 | 가능 | 분회 또는 담당 범위 | 담당 범위 |
| 회원정보 등록/수정 | 가능 | 제한 가능 | 제한 가능 |
| 회비 정보 조회 | 가능 | 분회 또는 담당 범위 | 담당 범위 |
| 회비 정보 수정 | 가능 | 제한 가능 | 제한 가능 |
| 문서 등록 | 가능 | 가능 | 가능 |
| 문서 승인 | 가능 | 가능 | 불가 |
| 업무요청 처리 | 가능 | 가능 | 가능 |
| 사용자 계정 승인 | 가능 | 제한 가능 | 불가 |
| 사용자 권한 변경 | 가능 | 불가 또는 제한 | 불가 |
| 감사로그 조회 | 가능 | 제한 가능 | 불가 |
| 시스템 설정 | 가능 | 불가 | 불가 |

---

## 2-3. 권한 설계 원칙

- `master`는 전체 시스템을 관리한다.
- `submaster`는 역할에 따라 범위가 달라질 수 있다.
  - 분회 회장: 본인 소속분회 중심
  - 사무국장: 사무국 업무 전체 중심
- `user`는 사무국 직원의 일반 업무 처리 권한이다.
- 회원가입 시 사용자가 선택하는 권한은 **요청 권한**으로 저장한다.
- 최종 권한 부여는 `master` 또는 승인 권한이 있는 `submaster`가 승인해야 한다.
- 승인 전 계정은 로그인할 수 없거나, 로그인 시 `승인 대기` 화면만 표시한다.

---

## 3. 로그인 화면 PRD

## 3-1. Route

```txt
/login
```

---

## 3-2. 화면 목적

사용자가 ERP에 접속하기 위해 ID와 PW를 입력하는 화면이다.

로그인 화면에서는 소셜 로그인 버튼을 제공하지 않는다.

---

## 3-3. 로그인 화면 구성

### 좌측 영역 또는 상단 브랜드 영역

- 인천시약사회 로고 또는 텍스트 로고
- 시스템명: `인천시약사회 Admin Center`
- 보조 문구: `사무국 업무지원 ERP`

### 로그인 카드

로그인 카드에는 다음 요소를 표시한다.

| 항목 | 설명 |
|---|---|
| 제목 | `로그인` |
| 설명 | `인천시약사회 사무국 ERP에 접속합니다.` |
| ID 입력 | 사용자 ID 입력 |
| PW 입력 | 비밀번호 입력 |
| 로그인 버튼 | ID/PW 검증 후 로그인 |
| 회원가입 링크 | 회원가입 화면으로 이동 |
| 비밀번호 찾기 링크 | MVP에서는 비활성 또는 준비중 표시 가능 |

---

## 3-4. 입력 필드

### ID

- 필수값
- placeholder: `ID를 입력하세요`
- 영문, 숫자, 특수문자 `_`, `-` 허용
- 최소 4자 이상
- 최대 30자

### PW

- 필수값
- placeholder: `비밀번호를 입력하세요`
- 입력값은 password type으로 마스킹
- Caps Lock 감지 문구는 선택사항

---

## 3-5. 로그인 검증 정책

### 성공 조건

- ID가 존재해야 한다.
- PW가 일치해야 한다.
- 계정 상태가 `approved`이어야 한다.
- 계정 상태가 `inactive`, `blocked`, `pending`, `rejected`이면 로그인 불가.

### 실패 메시지

보안상 구체적인 실패 사유를 노출하지 않는다.

```txt
ID 또는 비밀번호가 올바르지 않습니다.
```

단, 승인 대기 계정의 경우 다음 메시지를 표시할 수 있다.

```txt
관리자 승인 대기 중인 계정입니다. 승인 후 이용할 수 있습니다.
```

---

## 3-6. 로그인 성공 후 이동

로그인 성공 시 다음 화면으로 이동한다.

```txt
/dashboard
```

---

## 3-7. 로그인 화면 UI 와이어프레임

```txt
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                 인천시약사회 Admin Center                     │
│                 사무국 업무지원 ERP                           │
│                                                               │
│              ┌──────────────────────────────┐                 │
│              │ 로그인                       │                 │
│              │ 인천시약사회 ERP에 접속합니다 │                 │
│              │                              │                 │
│              │ ID                           │                 │
│              │ [__________________________] │                 │
│              │                              │                 │
│              │ PW                           │                 │
│              │ [__________________________] │                 │
│              │                              │                 │
│              │ [ 로그인 ]                   │                 │
│              │                              │                 │
│              │ 회원가입  |  비밀번호 찾기    │                 │
│              └──────────────────────────────┘                 │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 4. 회원가입 화면 PRD

## 4-1. Route

```txt
/signup
```

---

## 4-2. 화면 목적

ERP 사용자가 계정 생성을 신청하는 화면이다.

회원가입 후 바로 사용 가능한 구조가 아니라, 관리자 승인 후 로그인이 가능하도록 한다.

---

## 4-3. 회원가입 화면 구성

### 기본 구성

- 화면 제목: `회원가입 신청`
- 안내 문구: `인천시약사회 사무국 ERP 사용을 위한 계정 신청 화면입니다. 관리자 승인 후 이용할 수 있습니다.`
- 입력 폼
- 가입 신청 버튼
- 로그인으로 돌아가기 링크

---

## 4-4. 회원가입 필수 입력 정보

| 필드 | Key | 필수 여부 | 설명 |
|---|---|---:|---|
| 이름 | `name` | 필수 | 실제 사용자 이름 |
| 전화번호 | `phone` | 필수 | 휴대폰 번호 |
| ID | `loginId` | 필수 | 로그인에 사용할 ID |
| PW | `password` | 필수 | 로그인 비밀번호 |
| PW 확인 | `passwordConfirm` | 필수 | 비밀번호 재입력 |
| 소속분회 | `branchId` | 필수 | 소속 분회 선택 |
| 권한 | `requestedRole` | 필수 | 요청 권한 선택 |

---

## 4-5. 회원가입 추천 추가 필드

아래 필드는 MVP에서 포함을 권장한다.

| 필드 | Key | 필수 여부 | 설명 |
|---|---|---:|---|
| 이메일 | `email` | 선택 | 비밀번호 재설정, 알림 용도 |
| 직책 | `positionTitle` | 선택 | 예: 회장, 분회장, 사무국장, 직원, 정책이사 |
| 소속 기관/부서 | `organizationName` | 선택 | 예: 인천시약사회 사무국, 남동구분회 |
| 가입 신청 사유 | `requestReason` | 선택 | 관리자 승인 참고용 |
| 개인정보 처리 동의 | `privacyConsent` | 필수 | 계정 생성을 위한 개인정보 수집 동의 |

---

## 4-6. 소속분회 선택

### 데이터 관리 방식

소속분회는 하드코딩하지 않고 `branches` 테이블 또는 공통 코드 테이블에서 관리한다.

### 예시 option

```txt
- 인천시약사회 본회 / 사무국
- 중구분회
- 동구분회
- 미추홀구분회
- 연수구분회
- 남동구분회
- 부평구분회
- 계양구분회
- 서구분회
- 강화군분회
- 옹진군분회
- 기타
```

실제 운영 시 분회 명칭은 관리자 코드 관리 화면에서 수정 가능해야 한다.

---

## 4-7. 권한 선택

회원가입 화면에서 권한은 `요청 권한`으로 표시한다.

### 표시 옵션

| 표시명 | 저장값 | 설명 |
|---|---|---|
| 인천시약사회 회장 | `master` | 최고 관리자 권한 요청 |
| 분회 회장 / 사무국장 | `submaster` | 관리자 권한 요청 |
| 사무국 직원 | `user` | 일반 사용자 권한 요청 |

### 주의사항

- 회원가입 화면에서 선택한 권한은 즉시 적용하지 않는다.
- 가입 신청 상태는 `pending`으로 저장한다.
- `master`가 승인하면 실제 권한으로 반영한다.
- 권한 요청 내역은 감사로그에 저장한다.

---

## 4-8. 회원가입 검증 정책

### 이름

- 필수
- 2자 이상
- 30자 이하

### 전화번호

- 필수
- 숫자와 하이픈 허용
- 저장 시 숫자만 저장하거나, 입력 형식을 통일한다.
- 예: `010-1234-5678`

### ID

- 필수
- 중복 불가
- 영문, 숫자, `_`, `-` 허용
- 4자 이상 30자 이하
- 실시간 중복 확인 또는 제출 시 중복 확인

### PW

- 필수
- 최소 8자 이상
- 영문, 숫자 조합 권장
- 특수문자 포함 권장
- 비밀번호 확인값과 일치해야 한다.
- DB에는 반드시 해시값만 저장한다.

### 소속분회

- 필수
- 등록된 branch 중 하나여야 한다.

### 권한

- 필수
- `master`, `submaster`, `user` 중 하나여야 한다.
- 실제 반영은 승인 이후 처리한다.

### 개인정보 처리 동의

- 필수 체크
- 미동의 시 가입 신청 불가

---

## 4-9. 회원가입 성공 후 처리

가입 신청이 성공하면 다음 안내 화면 또는 모달을 표시한다.

```txt
회원가입 신청이 완료되었습니다.
관리자 승인 후 로그인이 가능합니다.
승인 완료 여부는 사무국 관리자에게 문의해 주세요.
```

버튼:

```txt
[로그인 화면으로 이동]
```

---

## 4-10. 회원가입 화면 와이어프레임

```txt
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                 인천시약사회 Admin Center                     │
│                 사무국 업무지원 ERP                           │
│                                                               │
│          ┌──────────────────────────────────────┐             │
│          │ 회원가입 신청                         │             │
│          │ 관리자 승인 후 이용할 수 있습니다.     │             │
│          │                                      │             │
│          │ 이름 *                               │             │
│          │ [_______________________________]    │             │
│          │                                      │             │
│          │ 전화번호 *                           │             │
│          │ [_______________________________]    │             │
│          │                                      │             │
│          │ ID *                                 │             │
│          │ [____________________] [중복확인]     │             │
│          │                                      │             │
│          │ PW *                                 │             │
│          │ [_______________________________]    │             │
│          │                                      │             │
│          │ PW 확인 *                            │             │
│          │ [_______________________________]    │             │
│          │                                      │             │
│          │ 소속분회 *                           │             │
│          │ [선택하세요 ▼]                       │             │
│          │                                      │             │
│          │ 요청 권한 *                          │             │
│          │ [선택하세요 ▼]                       │             │
│          │                                      │             │
│          │ 이메일                               │             │
│          │ [_______________________________]    │             │
│          │                                      │             │
│          │ 직책                                 │             │
│          │ [_______________________________]    │             │
│          │                                      │             │
│          │ 가입 신청 사유                       │             │
│          │ [_______________________________]    │             │
│          │                                      │             │
│          │ [ ] 개인정보 수집 및 이용에 동의합니다 │             │
│          │                                      │             │
│          │ [ 회원가입 신청 ]                     │             │
│          │                                      │             │
│          │ 이미 계정이 있으신가요? 로그인         │             │
│          └──────────────────────────────────────┘             │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 5. 자동 로그아웃 정책

## 5-1. 기본 정책

ERP 전체 화면에서 사용자의 입력 또는 조작이 없으면 **30분 후 자동 로그아웃**한다.

### 비활동 기준

다음 이벤트가 없으면 비활동 상태로 본다.

- mousemove
- mousedown
- keydown
- scroll
- touchstart
- click
- API 요청 성공

### 제한 시간

```txt
30분 = 1,800초 = 1,800,000ms
```

---

## 5-2. 자동 로그아웃 동작

30분 동안 화면 입력이 없으면 다음 순서로 처리한다.

1. 클라이언트 세션 삭제
2. 서버 refresh token 또는 session 무효화
3. 로그인 화면으로 이동
4. 안내 메시지 표시

```txt
보안을 위해 30분 동안 사용이 없어 자동 로그아웃되었습니다.
다시 로그인해 주세요.
```

---

## 5-3. 만료 1분 전 경고 모달

권장 기능으로, 자동 로그아웃 1분 전 경고 모달을 표시한다.

### 표시 시점

```txt
마지막 활동 후 29분 경과 시점
```

### 모달 문구

```txt
자동 로그아웃 안내
1분 후 자동 로그아웃됩니다.
계속 사용하시겠습니까?
```

### 버튼

```txt
[계속 사용] [로그아웃]
```

### 계속 사용 클릭 시

- 세션 타이머 초기화
- 필요 시 `/api/auth/refresh` 호출
- 모달 닫기

---

## 6. 인증 API 설계

## 6-1. 로그인

```http
POST /api/auth/login
```

### Request

```json
{
  "loginId": "office001",
  "password": "password123"
}
```

### Response: Success

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "user": {
    "id": "user_001",
    "name": "홍길동",
    "loginId": "office001",
    "role": "user",
    "branchId": "branch_001",
    "branchName": "인천시약사회 본회 / 사무국",
    "accountStatus": "approved"
  }
}
```

### Response: Failure

```json
{
  "message": "ID 또는 비밀번호가 올바르지 않습니다."
}
```

---

## 6-2. 회원가입 신청

```http
POST /api/auth/signup
```

### Request

```json
{
  "name": "홍길동",
  "phone": "010-1234-5678",
  "loginId": "office001",
  "password": "password123",
  "branchId": "branch_001",
  "requestedRole": "user",
  "email": "office@example.com",
  "positionTitle": "사무국 직원",
  "organizationName": "인천시약사회 사무국",
  "requestReason": "사무국 ERP 업무 처리를 위해 신청합니다.",
  "privacyConsent": true
}
```

### Response

```json
{
  "message": "회원가입 신청이 완료되었습니다. 관리자 승인 후 이용할 수 있습니다.",
  "accountStatus": "pending"
}
```

---

## 6-3. ID 중복 확인

```http
GET /api/auth/check-login-id?loginId=office001
```

### Response

```json
{
  "available": true
}
```

---

## 6-4. 내 정보 조회

```http
GET /api/auth/me
```

### Response

```json
{
  "id": "user_001",
  "name": "홍길동",
  "loginId": "office001",
  "role": "user",
  "branchId": "branch_001",
  "branchName": "인천시약사회 본회 / 사무국",
  "accountStatus": "approved"
}
```

---

## 6-5. 토큰 갱신

```http
POST /api/auth/refresh
```

### Request

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

### Response

```json
{
  "accessToken": "new-jwt-access-token"
}
```

---

## 6-6. 로그아웃

```http
POST /api/auth/logout
```

### Request

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

### Response

```json
{
  "message": "로그아웃되었습니다."
}
```

---

## 7. 사용자 승인 API 설계

관리자 화면에서 회원가입 신청 계정을 승인하거나 반려한다.

## 7-1. 승인 대기 사용자 목록

```http
GET /api/admin/users/pending
```

---

## 7-2. 사용자 승인

```http
POST /api/admin/users/:userId/approve
```

### Request

```json
{
  "role": "user",
  "branchId": "branch_001"
}
```

### Response

```json
{
  "message": "사용자 계정이 승인되었습니다.",
  "accountStatus": "approved"
}
```

---

## 7-3. 사용자 반려

```http
POST /api/admin/users/:userId/reject
```

### Request

```json
{
  "reason": "신청 정보 확인이 필요합니다."
}
```

### Response

```json
{
  "message": "사용자 계정 신청이 반려되었습니다.",
  "accountStatus": "rejected"
}
```

---

## 8. DB 모델 설계

## 8-1. users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(100),
  login_id VARCHAR(30) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  requested_role VARCHAR(20),
  branch_id UUID,
  position_title VARCHAR(100),
  organization_name VARCHAR(100),
  request_reason TEXT,
  account_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  privacy_consent BOOLEAN NOT NULL DEFAULT FALSE,
  approved_by UUID,
  approved_at TIMESTAMP,
  rejected_reason TEXT,
  last_login_at TIMESTAMP,
  last_activity_at TIMESTAMP,
  failed_login_count INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 8-2. branches

```sql
CREATE TABLE branches (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 8-3. auth_sessions

```sql
CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  refresh_token_hash TEXT NOT NULL,
  ip_address VARCHAR(100),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 8-4. audit_logs

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(100),
  target_id UUID,
  before_value JSONB,
  after_value JSONB,
  ip_address VARCHAR(100),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 9. 계정 상태값

```ts
type AccountStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "inactive"
  | "blocked";
```

| 상태 | 설명 |
|---|---|
| pending | 회원가입 신청 후 승인 대기 |
| approved | 승인 완료, 로그인 가능 |
| rejected | 신청 반려 |
| inactive | 관리자에 의해 비활성화 |
| blocked | 보안상 차단 |

---

## 10. 프론트엔드 컴포넌트 설계

## 10-1. LoginPage

```tsx
type LoginFormValues = {
  loginId: string;
  password: string;
};
```

### 포함 컴포넌트

- `AuthLayout`
- `LoginForm`
- `TextInput`
- `PasswordInput`
- `PrimaryButton`
- `AuthLink`

---

## 10-2. SignupPage

```tsx
type SignupFormValues = {
  name: string;
  phone: string;
  loginId: string;
  password: string;
  passwordConfirm: string;
  branchId: string;
  requestedRole: "master" | "submaster" | "user";
  email?: string;
  positionTitle?: string;
  organizationName?: string;
  requestReason?: string;
  privacyConsent: boolean;
};
```

### 포함 컴포넌트

- `AuthLayout`
- `SignupForm`
- `TextInput`
- `PasswordInput`
- `SelectInput`
- `CheckboxInput`
- `PrimaryButton`
- `AuthLink`

---

## 10-3. AutoLogoutProvider

ERP 전체 앱을 감싸는 Provider로 구현한다.

```tsx
type AutoLogoutProviderProps = {
  children: React.ReactNode;
  timeoutMs?: number;
  warningMs?: number;
};
```

### 기본값

```ts
const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000;
const DEFAULT_WARNING_MS = 60 * 1000;
```

### 적용 위치

```tsx
<AutoLogoutProvider timeoutMs={30 * 60 * 1000} warningMs={60 * 1000}>
  <AdminLayout>{children}</AdminLayout>
</AutoLogoutProvider>
```

---

## 11. CSS / Tailwind 디자인 기준

기존 Admin Center 테마를 유지한다.

## 11-1. Design Token

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
}
```

---

## 11-2. AuthLayout 스타일

### 화면 구조

- 전체 배경: `#F5F7FA`
- 화면 중앙 정렬
- 로그인 카드 너비: `420px`
- 회원가입 카드 너비: `520px`
- 카드 배경: `#FFFFFF`
- border: `1px solid #E5EAF0`
- border-radius: `20px`
- padding: `32px`
- shadow: 최소화

### CSS 예시

```css
.auth-page {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.auth-card {
  width: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  padding: 32px;
}

.auth-card.login {
  max-width: 420px;
}

.auth-card.signup {
  max-width: 520px;
}

.auth-logo {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text-primary);
  text-align: center;
  margin-bottom: 6px;
}

.auth-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  text-align: center;
  margin-bottom: 28px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #FFFFFF;
  padding: 12px 14px;
  font-size: 14px;
  color: var(--color-text-primary);
  outline: none;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}

.primary-button {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #FFFFFF;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.primary-button:hover {
  background: var(--color-primary-dark);
}

.auth-link-row {
  margin-top: 18px;
  display: flex;
  justify-content: center;
  gap: 12px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.auth-link {
  color: var(--color-primary-dark);
  font-weight: 600;
  text-decoration: none;
}

.form-error {
  font-size: 12px;
  color: var(--color-danger);
  margin-top: 4px;
}

.form-help {
  font-size: 12px;
  color: var(--color-text-muted);
}
```

---

## 12. 보안 요구사항

## 12-1. 비밀번호 저장

- 비밀번호는 평문 저장 금지
- bcrypt 또는 argon2 해시 사용
- password_hash만 DB 저장

---

## 12-2. 토큰 저장

권장 방식:

- access token: 메모리 또는 httpOnly cookie
- refresh token: httpOnly secure cookie 또는 서버 세션 테이블에 해시 저장
- localStorage에 refresh token 저장 금지 권장

---

## 12-3. 로그인 실패 제한

권장 정책:

- 5회 연속 실패 시 10분 잠금
- 실패 횟수는 `failed_login_count`에 기록
- 잠금 해제 시 실패 횟수 초기화

---

## 12-4. 감사로그 기록 대상

다음 이벤트는 audit_logs에 기록한다.

| Action | 설명 |
|---|---|
| `AUTH_LOGIN_SUCCESS` | 로그인 성공 |
| `AUTH_LOGIN_FAILURE` | 로그인 실패 |
| `AUTH_LOGOUT` | 로그아웃 |
| `AUTH_AUTO_LOGOUT` | 30분 미사용 자동 로그아웃 |
| `AUTH_SIGNUP_REQUESTED` | 회원가입 신청 |
| `USER_APPROVED` | 사용자 승인 |
| `USER_REJECTED` | 사용자 반려 |
| `USER_ROLE_CHANGED` | 사용자 권한 변경 |
| `USER_STATUS_CHANGED` | 사용자 상태 변경 |

---

## 13. Codex 개발 지시문

아래 내용을 Codex에 그대로 전달하여 개발을 진행한다.

```txt
인천시약사회 사무국 ERP의 인증 기능을 구현한다.

1. 권한 구조
- role은 master, submaster, user 세 가지로 구성한다.
- 인천시약사회 회장은 master이다.
- 인천시약사회 각 분회 회장과 사무국장은 submaster이다.
- 인천시약사회 사무국 직원은 user이다.
- 회원가입 시 선택한 권한은 requestedRole로 저장하고, 실제 role은 관리자 승인 이후 반영한다.

2. 로그인 화면
- route는 /login 이다.
- 소셜 로그인은 사용하지 않는다.
- ID와 PW 입력만 제공한다.
- 회원가입 링크를 제공한다.
- 로그인 성공 시 /dashboard로 이동한다.
- 로그인 실패 시 “ID 또는 비밀번호가 올바르지 않습니다.” 메시지를 표시한다.
- 승인 대기 계정은 로그인할 수 없으며, 승인 대기 안내 메시지를 표시한다.

3. 회원가입 화면
- route는 /signup 이다.
- 입력 필드는 이름, 전화번호, ID, PW, PW 확인, 소속분회, 요청 권한을 필수로 한다.
- 추가 필드로 이메일, 직책, 소속 기관/부서, 가입 신청 사유를 제공한다.
- 개인정보 수집 및 이용 동의 체크박스를 필수로 한다.
- 가입 신청 성공 시 accountStatus는 pending으로 저장한다.
- 가입 완료 후 “관리자 승인 후 이용할 수 있습니다.” 메시지를 표시한다.

4. 자동 로그아웃
- 전체 ERP 화면에서 30분 동안 입력이 없으면 자동 로그아웃한다.
- mousemove, mousedown, keydown, scroll, touchstart, click 이벤트 발생 시 타이머를 초기화한다.
- 자동 로그아웃 1분 전 경고 모달을 표시한다.
- 경고 모달에는 “계속 사용”과 “로그아웃” 버튼을 표시한다.
- 자동 로그아웃 시 /login으로 이동하고 안내 메시지를 표시한다.

5. API
- POST /api/auth/login
- POST /api/auth/signup
- GET /api/auth/check-login-id
- GET /api/auth/me
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/admin/users/pending
- POST /api/admin/users/:userId/approve
- POST /api/admin/users/:userId/reject

6. DB
- users 테이블을 만든다.
- branches 테이블을 만든다.
- auth_sessions 테이블을 만든다.
- audit_logs 테이블을 만든다.
- password는 반드시 password_hash로 저장한다.
- refresh_token은 원문 저장하지 않고 hash로 저장한다.

7. CSS
- 기존 Admin Center 테마를 유지한다.
- 전체 배경은 #F5F7FA를 사용한다.
- 카드 배경은 #FFFFFF, border는 #E5EAF0, radius는 20px를 사용한다.
- primary color는 #10B981를 사용한다.
- 텍스트 기본색은 #111827, 보조색은 #667085를 사용한다.
- 로그인 카드는 max-width 420px, 회원가입 카드는 max-width 520px로 한다.
- 과도한 그림자는 사용하지 않는다.

8. 보안
- 비밀번호는 bcrypt 또는 argon2로 해시한다.
- 로그인 실패 5회 시 10분 잠금을 적용한다.
- 로그인 성공, 실패, 로그아웃, 자동 로그아웃, 회원가입 신청, 사용자 승인, 반려, 권한 변경은 audit_logs에 기록한다.
```

---

## 14. MVP 완료 기준

다음 조건을 만족하면 로그인 / 회원가입 MVP가 완료된 것으로 본다.

- `/login` 화면에서 ID/PW로 로그인할 수 있다.
- 소셜 로그인 버튼이 없다.
- 로그인 성공 시 `/dashboard`로 이동한다.
- 로그인 실패 시 공통 오류 메시지를 표시한다.
- 승인 대기 계정은 로그인할 수 없다.
- `/signup` 화면에서 회원가입 신청을 할 수 있다.
- 회원가입 필수값 검증이 작동한다.
- ID 중복 검사가 작동한다.
- 가입 신청 후 계정 상태가 `pending`으로 저장된다.
- 관리자가 가입 신청을 승인할 수 있다.
- 승인된 사용자는 실제 role을 부여받고 로그인할 수 있다.
- 30분 동안 입력이 없으면 자동 로그아웃된다.
- 자동 로그아웃 1분 전 경고 모달이 표시된다.
- 인증 관련 주요 이벤트가 audit_logs에 기록된다.
- 전체 CSS 스타일이 기존 Admin Center 테마와 일관된다.

---

## 15. 추후 확장 후보

- 비밀번호 찾기 / 재설정
- 이메일 인증
- 휴대폰 본인인증
- OTP 2차 인증
- IP 접근 제한
- 관리자별 접근 가능 분회 세부 설정
- 로그인 이력 관리자 화면
- 장기 미접속 계정 자동 비활성화
- 비밀번호 주기적 변경 안내

---

## Review Agent / 최종 보완 점검

개발과 QA가 완료된 뒤에는 배포 전 최종 보완 점검 전담 역할인 `Review Agent`를 둔다.

### 역할

- 구현 자체를 바꾸지 않고, 배포 가능 여부만 판단한다.
- 로그인, 로그아웃, 세션 만료, 권한 진입, 리다이렉트 흐름을 다시 점검한다.
- 문서 대비 누락, 회귀 위험, UX 불일치, 정책 위반, 운영 리스크를 찾는다.

### 금지사항

- 새 기능 설계
- 코드 구현
- 임의 리팩터링

### 입력

- 구현된 브랜치 또는 배포 후보
- PRD 및 정책 문서
- QA 결과

### 출력

- 발견 이슈 목록
- 심각도
- 재현 절차
- 수정 권고
- 배포 승인 보류 여부

### 판정

- `pass`
- `pass with notes`
- `block`

### 운영 원칙

- `QA Agent`가 통과 여부를 본다면, `Review Agent`는 실제 배포 적합성을 본다.
- `Review Agent`는 읽기 전용으로 운영한다.
- 발견된 이슈는 Dev Agent로 되돌려 보내고 재검증한다.
