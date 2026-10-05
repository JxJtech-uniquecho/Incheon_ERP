# Incheon ERP

인천시약사회 업무를 위한 ERP v1 프로젝트입니다.  
회원, 약국, 분회, 회비, 문서, 업무요청, 결재, 회의·행사, 설정까지 한 화면에서 관리할 수 있도록 구성한 Next.js 기반 내부 업무 시스템입니다.

## 주요 기능

- 대시보드
  - 회원 수, 약국 수, 회비 납부율, 미처리 업무, 결재 대기 건수를 한 번에 확인
  - 기간 필터 지원
  - AI 요약 카드와 추이 차트 제공
- 회원 관리
  - 회원, 약국, 분회, 임원·위원회 관리
  - 상태, 분회, 연도 등으로 목록 필터링
- 회비 관리
  - 회비 현황, 입금 관리, 미납자 관리
  - 납부 상태와 매칭 상태 기반 조회
- 문서 관리
  - 공문, 회의자료, 보도자료 관리
  - 결재 요청 및 상태 변경 흐름 지원
- 업무 및 결재
  - 민원·업무요청 접수 및 처리 상태 관리
  - 결재함에서 승인/반려 흐름 확인
- 회의·행사
  - 일정 등록 및 참석 대상 관리
- 설정
  - 사용자, 권한, 코드값, 알림 설정 mock 관리
- 인증
  - 로그인, 회원가입, 세션 만료 처리
  - 승인된 계정만 ERP 화면 접근 가능

## 기술 스택

- Next.js 16
- React 19
- TypeScript
- Prisma
- PostgreSQL
- NextAuth
- Recharts
- Lucide React
- Mistral AI SDK

## 프로젝트 구조

- `src/app` - App Router 기반 페이지와 API 라우트
- `src/components` - 대시보드, ERP 화면, 레이아웃, 인증 컴포넌트
- `src/lib` - 인증, 서버 로직, mock 데이터, DB 유틸리티
- `prisma` - 데이터 모델, 마이그레이션, 시드
- `docs` - 사용자 가이드와 참고 문서
- `01_src` - 초기 기획 문서와 참고 자료

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 참고해 `.env`를 준비합니다.

필수 예시:

```env
DATABASE_URL="postgresql://inpharmy:inpharmy_dev_password@localhost:5432/inpharmy_erp?schema=public"
AUTH_SECRET="replace-with-a-long-random-secret-before-production"
AUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret-before-production"
NEXTAUTH_URL="http://localhost:3000"
MISTRAL_API_KEY=""
```

인증 비밀값 두 개에는 동일한 임의 문자열을 설정합니다. `openssl rand -hex 32`로 생성할 수 있습니다.
`MISTRAL_API_KEY`는 AI 요약 생성에만 필요하며, 비워 두어도 로그인과 ERP 데이터 기능은 사용할 수 있습니다.
AI 요약에서 요청 한도 초과 안내가 나오면 Mistral 계정의 사용 한도를 확인하거나 잠시 후 재시도합니다.
`.env`는 Git에 포함되지 않습니다.

### 3. PostgreSQL 실행

현재 Mac에는 Homebrew PostgreSQL 16과 `inpharmy_erp` DB가 구성되어 있습니다.
DB는 Mac 로그인 시 자동 실행됩니다. 수동 시작/상태 확인:

```bash
brew services start postgresql@16
brew services list
```

새 환경에서 Docker를 사용하는 경우에는 대신 저장소의 Compose 설정을 실행합니다.
두 방식 모두 기본 포트 5432를 사용하므로 하나만 실행하세요.

```bash
docker compose up -d postgres
```

### 4. Prisma 초기화

```bash
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
```

기존 마이그레이션을 적용할 때는 `prisma:deploy`를 사용합니다.
`prisma:migrate`는 스키마 변경으로 새 마이그레이션을 만들 때 사용합니다.
시드는 초기 로컬 테스트용이며, 다시 실행하면 관리자 비밀번호와 샘플 데이터가 초기값으로 갱신됩니다.

### 5. 개발 서버 실행

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

브라우저에서 `http://localhost:3000`을 열면 로그인 화면으로 진입합니다.
프론트엔드와 `/api/*` 백엔드는 같은 Next.js 서버에서 실행되므로 별도의 백엔드 서버 명령은 필요하지 않습니다.
웹 서버를 종료하거나 Mac을 재시작한 경우 위 명령으로 다시 실행합니다.

## 기본 계정

seed 기준 초기 관리자 계정:

- ID: `admin`
- 비밀번호: `ChangeMe123!`

운영 전에 반드시 비밀번호를 변경하세요.

## 주요 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 실행
- `npm run lint` - ESLint 검사
- `npm run prisma:generate` - Prisma Client 생성
- `npm run prisma:migrate` - 마이그레이션 실행
- `npm run prisma:deploy` - 기존 마이그레이션 적용
- `npm run prisma:seed` - 시드 데이터 적재

## 접근 흐름

- `/login` - 로그인
- `/signup` - 회원가입 신청
- `/dashboard` - 메인 대시보드
- `/members`, `/pharmacies`, `/dues`, `/documents`, `/tickets`, `/approvals`, `/events`, `/settings` - ERP 기능 화면

## 참고

- 승인되지 않은 계정은 ERP 화면에 접근할 수 없습니다.
- 이 저장소에는 샘플 데이터와 mock 기반 화면이 포함되어 있습니다.
- 실제 운영 데이터 연결 전에는 DB, 인증 비밀값, AI API 키를 반드시 점검해야 합니다.
