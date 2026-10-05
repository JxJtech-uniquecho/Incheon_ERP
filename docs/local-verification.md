# 로컬 실행 검증 (2026-10-05)

대상: `http://localhost:3000` 개발 서버, PostgreSQL 16 / `inpharmy_erp`.
Next.js가 웹 화면과 API를 함께 제공하며, PostgreSQL은 Homebrew 서비스로 실행합니다.

## 완료한 구성

- Prisma Client 생성, 기존 마이그레이션 3개 적용, 테스트 데이터 입력
- 관리자 계정: `admin` / `ChangeMe123!`
- 인증 비밀값과 DB 연결은 Git에서 제외되는 `.env`에 저장
- Next.js 16의 경로 처리를 `src/proxy.ts`에 배치
- 로그인 페이지의 비동기 검색 파라미터 처리 수정
- 회원가입용 분회 선택 API 추가: ID와 이름만 공개
- 회원가입 완료 후 폼 초기화 오류 수정
- AI 서비스 요청 한도 초과 시 HTTP 429와 한국어 안내 반환

## 검증 결과

- `npm run lint`, `npm run build` 통과
- `prisma migrate status`: DB 스키마 최신 상태
- 브라우저 관리자 로그인 및 로그인 전 요청 화면으로 복귀
- 비로그인 API 접근 차단, 일반 사용자의 관리자 API 접근 차단
- 14개 ERP 리소스 API 및 대시보드 집계 조회 성공
- 회원 데이터 등록·수정·조회·삭제 및 PostgreSQL 반영 확인
- ERP 화면 16개 렌더링, 브라우저 런타임 예외 없음
- 브라우저 회원가입 → 승인 전 로그인 차단 → 관리자 승인 → 로그인 성공
- 만료 세션 접근 차단, 로그아웃 후 세션 무효화 확인
- 검증용 회원과 신규 가입 계정 정리 완료

## 최종 읽기 전용 검토

Result: pass with notes — 로컬 ERP 실행 검증 완료.

- AI 요약 생성은 Mistral이 `429 Rate limit exceeded`를 반환하여 성공 여부를 확인하지 못했습니다. 요청 한도 안내는 검증했습니다. Mistral 계정의 제한이 해제된 후 재확인이 필요합니다.
- 검증 대상은 로컬 개발 실행입니다. 외부 공개 운영 배포 검증은 포함하지 않습니다.
- 재시작 방법과 DB 실행 방법은 루트 README를 참고하세요.
