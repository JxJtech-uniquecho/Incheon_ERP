import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "docs", "inpharmy-erp-guide");
const assetsDir = path.join(outDir, "assets");
const htmlPath = path.join(outDir, "index.html");
const pdfPath = path.join(outDir, "inpharmy-erp-user-guide.pdf");
const baseUrl = process.env.GUIDE_BASE_URL ?? "http://127.0.0.1:3002";
const chromiumPath =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ??
  "/Users/sunghuncho/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";

const generatedDate = "2026년 7월 2일";

const pages = [
  {
    group: "소개",
    route: "/dashboard",
    file: "dashboard.png",
    title: "홈 대시보드",
    summary: "핵심 지표, 기간 필터, AI 요약, 최근 업무 현황을 한 화면에서 확인합니다.",
    fields: "기간, KPI 카드, AI 요약, 회비 추이, 최근 문서/업무",
    flow: "기간을 선택하고 조회한 뒤, 주요 카드와 표를 통해 미처리 항목을 확인합니다.",
    note: "전체 운영 상황을 요약하는 첫 화면입니다."
  },
  {
    group: "회원 관리",
    route: "/members",
    file: "members.png",
    title: "회원 관리",
    summary: "면허번호, 분회, 상태 기준으로 회원을 조회하고 등록/수정/탈퇴 처리를 수행합니다.",
    fields: "검색어, 분회 필터, 상태 필터, 회원 상세, 면허번호",
    flow: "목록에서 대상을 선택하고, 상세에서 수정 또는 상태 변경을 진행합니다.",
    note: "개인 식별 정보가 포함되는 영역은 캡처 시 마스킹했습니다."
  },
  {
    group: "회원 관리",
    route: "/pharmacies",
    file: "pharmacies.png",
    title: "약국 관리",
    summary: "약국 주소, 대표약사, 운영상태를 기준으로 약국 정보를 관리합니다.",
    fields: "분회, 운영상태, 유형, 주소, 대표약사",
    flow: "필터로 대상을 좁히고, 상세에서 개설 정보와 운영 상태를 확인합니다.",
    note: "연락처와 세부 식별 값은 마스킹 처리했습니다."
  },
  {
    group: "회원 관리",
    route: "/members/branches",
    file: "branches.png",
    title: "분회 관리",
    summary: "분회별 회원수, 약국수, 분회장 정보를 한 화면에서 관리합니다.",
    fields: "상태, 분회장, 회원/약국 수, 분회별 기준일",
    flow: "분회 상태를 확인하고, 상세에서 구성 통계와 책임자를 검토합니다.",
    note: "운영 통계와 책임자 정보 중심의 관리 화면입니다."
  },
  {
    group: "회원 관리",
    route: "/members/committees",
    file: "committees.png",
    title: "임원·위원회 관리",
    summary: "직책, 위원회, 임기 상태를 기준으로 임원 정보를 관리합니다.",
    fields: "임기상태, 구분, 직책, 위원회, 임기",
    flow: "위원회별로 조회한 뒤, 임기 종료나 직책 변경을 반영합니다.",
    note: "임기 관리와 조직 구성 확인에 사용합니다."
  },
  {
    group: "회비 관리",
    route: "/dues",
    file: "dues.png",
    title: "회비 현황",
    summary: "연도와 납부상태별 회비 납부율과 회원별 납부 내역을 확인합니다.",
    fields: "연도, 분회, 납부상태, 금액, 납부일",
    flow: "필터로 연도와 상태를 좁힌 뒤, 납부완료/미납 현황을 확인합니다.",
    note: "회비 통계의 기준 화면입니다."
  },
  {
    group: "회비 관리",
    route: "/dues/payments",
    file: "payments.png",
    title: "입금 관리",
    summary: "입금 내역과 회비 매칭 상태를 관리하고 미매칭 입금을 정리합니다.",
    fields: "분회, 매칭상태, 입금액, 입금일",
    flow: "입금자명 또는 상태로 검색한 뒤, 매칭 처리와 수정 작업을 수행합니다.",
    note: "회비 수납의 실무 처리 화면입니다."
  },
  {
    group: "회비 관리",
    route: "/dues/unpaid",
    file: "unpaid.png",
    title: "미납자 관리",
    summary: "미납 회원 목록과 독촉 상태를 관리하고 안내 발송을 수행합니다.",
    fields: "연도, 분회, 납부상태, 미납금액, 독촉 메모",
    flow: "미납 대상자를 확인하고, 안내 발송 또는 제외 처리를 진행합니다.",
    note: "독촉 기록과 발송 메모가 중요한 화면입니다."
  },
  {
    group: "문서 관리",
    route: "/documents",
    file: "documents.png",
    title: "공문 관리",
    summary: "문서번호와 결재상태 기준으로 공문을 등록하고 결재 요청을 처리합니다.",
    fields: "결재상태, 유형, 문서번호, 작성자, 수신처",
    flow: "문서를 등록하고 상태를 변경하며, 필요 시 상세에서 결재 흐름을 확인합니다.",
    note: "대외 공문과 내부 문서의 기준 화면입니다."
  },
  {
    group: "문서 관리",
    route: "/documents/meetings",
    file: "meeting-docs.png",
    title: "회의자료",
    summary: "회의별 자료 목록과 공개 범위를 관리합니다.",
    fields: "공개상태, 회의명, 첨부, 자료구분",
    flow: "회의명을 확인하고 공개/비공개 상태를 전환합니다.",
    note: "회의 운영 문서의 배포 범위를 관리합니다."
  },
  {
    group: "문서 관리",
    route: "/documents/press",
    file: "press.png",
    title: "보도자료",
    summary: "보도자료의 작성, 검토, 배포 상태를 관리합니다.",
    fields: "배포상태, 유형, 배포일, 승인자",
    flow: "배포 전 검토 상태를 확인하고, 최종 배포 전 상태를 변경합니다.",
    note: "대외 홍보 자료의 진행 단계 관리 화면입니다."
  },
  {
    group: "업무 관리",
    route: "/tickets",
    file: "tickets.png",
    title: "민원·업무요청",
    summary: "접수, 배정, 처리중, 보류, 완료 상태로 업무 요청을 관리합니다.",
    fields: "처리상태, 유형, 우선순위, 담당자, 처리기한",
    flow: "요청을 접수한 뒤 담당자를 배정하고 처리 상태를 갱신합니다.",
    note: "민원 이력과 담당자 추적이 핵심입니다."
  },
  {
    group: "업무 관리",
    route: "/approvals",
    file: "approvals.png",
    title: "결재함",
    summary: "결재 대기, 진행, 완료, 반려 문서를 조회하고 승인/반려를 처리합니다.",
    fields: "결재상태, 문서유형, 결재자, 의견",
    flow: "대기 문서를 선택해 의견을 남기고 승인 또는 반려합니다.",
    note: "결재선 검토와 의견 기록이 중심입니다."
  },
  {
    group: "업무 관리",
    route: "/events",
    file: "events.png",
    title: "회의·행사",
    summary: "회의와 행사 일정을 캘린더형 목록으로 확인하고 참석 대상을 관리합니다.",
    fields: "상태, 유형, 일정일, 장소",
    flow: "일정 등록 후 참석 대상을 확인하고 완료 여부를 갱신합니다.",
    note: "일정과 행사 공지의 운영 화면입니다."
  },
  {
    group: "시스템 관리",
    route: "/settings",
    file: "settings.png",
    title: "설정",
    summary: "사용자, 권한, 코드값, 알림 설정을 관리하는 시스템 구성 화면입니다.",
    fields: "상태, 유형, 대상, 설명",
    flow: "설정 항목을 추가하거나 비활성화하고, 적용 상태를 확인합니다.",
    note: "운영 정책과 공통 코드의 확장 포인트입니다."
  },
  {
    group: "시스템 관리",
    route: "/settings/users",
    file: "users.png",
    title: "사용자 승인",
    summary: "가입 신청 계정을 검토하고 권한을 부여하거나 반려합니다.",
    fields: "승인대기, 권한, 분회, 요청 사유, 연락처",
    flow: "대기 계정을 선택하고 권한을 지정한 뒤 승인 또는 반려합니다.",
    note: "계정 발급과 권한 승인 절차를 담당합니다."
  }
];

const groupOrder = ["소개", "회원 관리", "회비 관리", "문서 관리", "업무 관리", "시스템 관리"];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildHtml(items) {
  const cardsByGroup = new Map(groupOrder.map((group) => [group, items.filter((item) => item.group === group)]));

  const toc = [
    { id: "intro", label: "소개서" },
    { id: "system", label: "시스템 구성" },
    { id: "usage", label: "공통 사용법" },
    { id: "modules", label: "모듈별 가이드" },
    { id: "appendix", label: "부록" }
  ];

  const cardHtml = (item) => `
    <article class="screen-card">
      <div class="screen-card__header">
        <div>
          <p class="screen-card__eyebrow">${escapeHtml(item.group)}</p>
          <h3>${escapeHtml(item.title)}</h3>
        </div>
        <span class="screen-card__route">${escapeHtml(item.route)}</span>
      </div>
      <p class="screen-card__summary">${escapeHtml(item.summary)}</p>
      <figure class="screen-shot">
        <img src="./assets/${escapeHtml(item.file)}" alt="${escapeHtml(item.title)} 화면 캡처" />
        <figcaption>${escapeHtml(item.note)}</figcaption>
      </figure>
      <dl class="meta-list">
        <div><dt>주요 항목</dt><dd>${escapeHtml(item.fields)}</dd></div>
        <div><dt>업무 흐름</dt><dd>${escapeHtml(item.flow)}</dd></div>
      </dl>
    </article>
  `;

  return `<!doctype html>
  <html lang="ko">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>인Pharmy ERP 통합 사용자 안내서</title>
      <style>
        :root {
          --bg: #f3f7fb;
          --bg-alt: #ebf1f7;
          --panel: #ffffff;
          --text: #142033;
          --muted: #5e6b7f;
          --line: #d7e0ea;
          --accent: #0f6b8f;
          --accent-2: #11644c;
          --accent-soft: rgba(15, 107, 143, 0.12);
          --shadow: 0 18px 42px rgba(10, 25, 45, 0.10);
          --radius: 22px;
        }

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          margin: 0;
          color: var(--text);
          font-family: "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
          background:
            radial-gradient(circle at top left, rgba(15, 107, 143, 0.14), transparent 30%),
            radial-gradient(circle at top right, rgba(17, 100, 76, 0.10), transparent 26%),
            linear-gradient(180deg, #f8fbfd 0%, var(--bg) 38%, #eef4f9 100%);
          line-height: 1.55;
          counter-reset: page;
        }

        a { color: inherit; }
        .page {
          width: min(1120px, calc(100% - 40px));
          margin: 20px auto 36px;
        }

        .hero {
          padding: 34px 38px;
          background:
            linear-gradient(140deg, rgba(15, 107, 143, 0.96), rgba(17, 100, 76, 0.93)),
            url("./assets/dashboard.png") center/cover;
          color: #fff;
          border-radius: 30px;
          box-shadow: var(--shadow);
          position: relative;
          overflow: hidden;
          min-height: 310px;
          display: grid;
          align-content: space-between;
          gap: 26px;
        }

        .hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(255,255,255,0.08), transparent 40%, rgba(255,255,255,0.04));
          pointer-events: none;
        }

        .hero-top, .hero-bottom { position: relative; z-index: 1; }
        .eyebrow {
          margin: 0 0 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.82);
        }
        .hero h1 {
          margin: 0;
          font-size: clamp(32px, 4vw, 54px);
          line-height: 1.08;
          letter-spacing: -0.04em;
          max-width: 10ch;
        }
        .hero p {
          margin: 14px 0 0;
          max-width: 760px;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.88);
        }
        .hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .hero-badge {
          padding: 9px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.18);
          font-size: 13px;
          font-weight: 600;
          backdrop-filter: blur(8px);
        }

        .content {
          margin-top: 22px;
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 22px;
          align-items: start;
        }
        .toc, .section, .appendix {
          background: rgba(255, 255, 255, 0.82);
          border: 1px solid rgba(215, 224, 234, 0.88);
          box-shadow: var(--shadow);
          backdrop-filter: blur(12px);
        }
        .toc {
          border-radius: 24px;
          padding: 18px;
          position: sticky;
          top: 16px;
        }
        .toc h2, .section h2, .appendix h2 {
          margin: 0 0 12px;
          font-size: 20px;
          letter-spacing: -0.03em;
        }
        .toc ol {
          margin: 0;
          padding: 0 0 0 18px;
          display: grid;
          gap: 10px;
        }
        .toc a {
          text-decoration: none;
          color: var(--text);
        }
        .toc a:hover { color: var(--accent); }
        .toc small { color: var(--muted); display: block; margin-top: 2px; }
        .toc li { padding-left: 4px; }

        .stack { display: grid; gap: 18px; }
        .section, .appendix {
          border-radius: 28px;
          padding: 26px;
        }
        .section__intro {
          display: grid;
          gap: 14px;
          margin-bottom: 18px;
        }
        .section__intro p { margin: 0; color: var(--muted); }
        .pill-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .pill {
          padding: 7px 12px;
          border-radius: 999px;
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 13px;
          font-weight: 600;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-top: 16px;
        }
        .info-card {
          border: 1px solid var(--line);
          border-radius: 18px;
          background: rgba(255,255,255,0.9);
          padding: 16px 18px;
        }
        .info-card h3 {
          margin: 0 0 6px;
          font-size: 15px;
        }
        .info-card p {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
        }

        .common-flow {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .flow-card {
          border-radius: 18px;
          border: 1px solid var(--line);
          background: linear-gradient(180deg, #fff, #f7fafc);
          padding: 16px 18px;
        }
        .flow-card strong { display: block; margin-bottom: 6px; }
        .flow-card p { margin: 0; color: var(--muted); font-size: 14px; }

        .module-grid {
          display: grid;
          gap: 18px;
        }
        .module-group {
          padding-top: 8px;
        }
        .module-group h3 {
          margin: 0 0 12px;
          font-size: 18px;
          letter-spacing: -0.02em;
        }
        .module-group p.sub {
          margin: 0 0 18px;
          color: var(--muted);
        }
        .screen-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }
        .screen-card {
          border-radius: 22px;
          border: 1px solid var(--line);
          background: var(--panel);
          padding: 18px;
          display: grid;
          gap: 14px;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .screen-card__header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: start;
        }
        .screen-card__eyebrow {
          margin: 0 0 4px;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
          font-weight: 700;
        }
        .screen-card h3 {
          margin: 0;
          font-size: 18px;
          letter-spacing: -0.02em;
        }
        .screen-card__route {
          font-size: 12px;
          color: var(--muted);
          background: #f2f6fa;
          border: 1px solid #e2e8f0;
          padding: 6px 9px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .screen-card__summary {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
        }
        .screen-shot {
          margin: 0;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid #dce4ed;
          background: #edf3f8;
        }
        .screen-shot img {
          width: 100%;
          display: block;
          height: auto;
        }
        .screen-shot figcaption {
          padding: 10px 12px;
          font-size: 12px;
          color: var(--muted);
          border-top: 1px solid #dce4ed;
          background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(245,249,252,0.95));
        }
        .meta-list {
          margin: 0;
          display: grid;
          gap: 10px;
        }
        .meta-list div {
          padding: 12px 14px;
          border-radius: 16px;
          background: #f8fbfd;
          border: 1px solid #e4ebf3;
        }
        .meta-list dt {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent-2);
          margin-bottom: 4px;
        }
        .meta-list dd {
          margin: 0;
          color: var(--text);
          font-size: 14px;
        }

        .faq {
          display: grid;
          gap: 12px;
          margin-top: 12px;
        }
        .faq-item {
          border-radius: 18px;
          background: #fff;
          border: 1px solid var(--line);
          padding: 16px 18px;
        }
        .faq-item strong { display: block; margin-bottom: 6px; }
        .faq-item p { margin: 0; color: var(--muted); font-size: 14px; }

        .footnote {
          margin-top: 18px;
          color: var(--muted);
          font-size: 13px;
        }

        .print-footer {
          position: fixed;
          bottom: 10mm;
          left: 0;
          right: 0;
          padding: 0 14mm;
          font-size: 11px;
          color: #5f6d80;
          display: flex;
          justify-content: space-between;
          pointer-events: none;
        }
        .print-footer::after {
          content: "Page " counter(page) " / " counter(pages);
        }

        @page {
          size: A4;
          margin: 16mm 14mm 18mm;
        }

        @media print {
          body { background: #fff; }
          .page { width: auto; margin: 0; }
          .print-footer { display: none; }
          .hero, .toc, .section, .appendix, .screen-card, .info-card, .flow-card, .faq-item {
            box-shadow: none !important;
          }
          .toc { position: static; }
          .content { grid-template-columns: 1fr; }
          .screen-grid, .info-grid, .common-flow { grid-template-columns: 1fr 1fr; }
          .hero { break-after: page; }
          .section, .appendix { break-inside: avoid-page; }
          .screen-card, .faq-item, .info-card, .flow-card { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <header class="hero">
          <div class="hero-top">
            <p class="eyebrow">InPharmy ERP / 통합 사용자 안내서</p>
            <h1>인Pharmy ERP 통합 사용자 안내서</h1>
            <p>현재 구현된 전체 메뉴를 기준으로 작성한 통합본입니다. 실제 화면 캡처를 사용하되, 개인정보성 값은 마스킹하여 배포용 문서로 정리했습니다.</p>
          </div>
          <div class="hero-bottom">
            <div class="hero-meta">
              <span class="hero-badge">작성 기준: ${escapeHtml(generatedDate)}</span>
              <span class="hero-badge">범위: 대시보드 + 15개 업무 화면</span>
              <span class="hero-badge">형식: HTML 원본 + PDF 배포본</span>
            </div>
          </div>
        </header>

        <div class="content">
          <nav class="toc" aria-label="목차">
            <h2>목차</h2>
            <ol>
              ${toc
                .map(
                  (entry) => `
                    <li><a href="#${escapeHtml(entry.id)}">${escapeHtml(entry.label)}</a><small>${escapeHtml(
                    entry.id === "intro"
                      ? "문서 목적과 범위"
                      : entry.id === "system"
                        ? "화면 구조와 데이터 흐름"
                        : entry.id === "usage"
                          ? "조회, 등록, 수정, 삭제, 상태 변경"
                          : entry.id === "modules"
                            ? "메뉴별 실제 화면과 사용 흐름"
                            : "FAQ, 주의사항, 운영 팁"
                  )}</small></li>`
                )
                .join("")}
            </ol>
          </nav>

          <main class="stack">
            <section class="section" id="intro">
              <div class="section__intro">
                <h2>소개서</h2>
                <p>인천시약사회 사무국 업무지원 ERP의 주요 목적, 대상 사용자, 문서 활용 방법을 요약합니다.</p>
                <div class="pill-row">
                  <span class="pill">회원 / 약국 / 분회</span>
                  <span class="pill">회비 / 입금 / 미납</span>
                  <span class="pill">공문 / 결재 / 행사</span>
                  <span class="pill">설정 / 승인 관리</span>
                </div>
              </div>
              <div class="info-grid">
                <article class="info-card">
                  <h3>목적</h3>
                  <p>회원 정보, 회비, 문서, 업무요청, 승인 업무를 한 시스템에서 관리합니다.</p>
                </article>
                <article class="info-card">
                  <h3>대상</h3>
                  <p>사무국, 분회 담당자, 임원, 결재권자, 사용자 승인 담당자가 공통으로 사용합니다.</p>
                </article>
                <article class="info-card">
                  <h3>산출물</h3>
                  <p>같은 내용을 HTML 원본으로 보관하고, 인쇄용 스타일이 적용된 PDF로 배포합니다.</p>
                </article>
              </div>
            </section>

            <section class="section" id="system">
              <div class="section__intro">
                <h2>시스템 구성</h2>
                <p>현재 앱은 Next.js 기반의 사무국 ERP로, 인증, 레이아웃, 공통 CRUD 워크스페이스, 대시보드 API가 분리되어 있습니다.</p>
              </div>
              <div class="common-flow">
                <article class="flow-card">
                  <strong>1. 인증 계층</strong>
                  <p>로그인 페이지에서 NextAuth credentials 인증을 수행하고, 세션 쿠키를 기반으로 ERP 화면 접근을 제어합니다.</p>
                </article>
                <article class="flow-card">
                  <strong>2. 공통 레이아웃</strong>
                  <p>관리용 레이아웃은 아이콘 레일과 모듈 사이드바를 공유하며, 활성 메뉴에 따라 현재 위치가 표시됩니다.</p>
                </article>
                <article class="flow-card">
                  <strong>3. 데이터 조회</strong>
                  <p>대시보드는 요약 API를, CRUD 화면은 공통 리소스 API를 통해 목록과 상세 데이터를 불러옵니다.</p>
                </article>
                <article class="flow-card">
                  <strong>4. 화면 패턴</strong>
                  <p>상단 헤더, KPI, 검색/필터, 표 목록, 상세 패널, 등록/수정 모달의 조합으로 화면이 구성됩니다.</p>
                </article>
              </div>
            </section>

            <section class="section" id="usage">
              <div class="section__intro">
                <h2>공통 사용법</h2>
                <p>모든 목록형 화면에서 같은 조작 규칙이 적용되므로, 먼저 이 절차를 익히면 각 메뉴를 빠르게 사용할 수 있습니다.</p>
              </div>
              <div class="common-flow">
                <article class="flow-card">
                  <strong>조회</strong>
                  <p>검색어와 필터를 조합해 대상을 좁히고, 초기화 버튼으로 조건을 다시 지웁니다.</p>
                </article>
                <article class="flow-card">
                  <strong>상세</strong>
                  <p>행 선택 또는 상세 아이콘을 눌러 오른쪽 상세 패널을 열고, 기준일과 추가 필드를 확인합니다.</p>
                </article>
                <article class="flow-card">
                  <strong>등록/수정</strong>
                  <p>우측 상단의 등록 버튼이나 상세 패널의 수정 버튼을 사용합니다. 입력 후 저장하면 목록이 갱신됩니다.</p>
                </article>
                <article class="flow-card">
                  <strong>상태 변경 / 삭제</strong>
                  <p>상태 버튼으로 흐름을 바꾸고, 삭제 버튼으로 제거합니다. 실제 운영 전에는 권한과 이력 정책을 반드시 확인합니다.</p>
                </article>
              </div>
              <p class="footnote">캡처본에서는 개인정보성 값, 연락처, 식별번호, 세부 메모의 가독성을 낮추는 방식으로 마스킹했습니다.</p>
            </section>

            <section class="section" id="modules">
              <div class="section__intro">
                <h2>모듈별 가이드</h2>
                <p>아래 화면들은 실제 구현된 전체 메뉴를 묶어서 정리한 대표 스크린샷입니다. 각 카드에는 목적, 주요 항목, 작업 흐름을 함께 적었습니다.</p>
              </div>

              ${groupOrder
                .map(
                  (group) => `
                    <div class="module-group">
                      <h3>${escapeHtml(group)}</h3>
                      <p class="sub">${escapeHtml(
                        group === "회원 관리"
                          ? "회원, 약국, 분회, 임원·위원회 관련 마스터 데이터를 관리합니다."
                          : group === "회비 관리"
                            ? "회비 납부와 입금, 미납자 독촉을 한 흐름으로 처리합니다."
                            : group === "문서 관리"
                              ? "대외 문서와 내부 배포 문서를 작성하고 공개 범위를 조정합니다."
                              : group === "업무 관리"
                                ? "민원, 결재, 일정 업무를 처리하고 상태를 전환합니다."
                                : "운영 설정과 사용자 승인 절차를 관리합니다."
                      )}</p>
                      <div class="screen-grid">
                        ${cardsByGroup.get(group)?.map(cardHtml).join("") ?? ""}
                      </div>
                    </div>
                  `
                )
                .join("")}
            </section>

            <section class="appendix" id="appendix">
              <div class="section__intro">
                <h2>부록</h2>
                <p>FAQ와 운영 주의사항을 정리했습니다.</p>
              </div>
              <div class="faq">
                <div class="faq-item">
                  <strong>Q. 캡처 화면은 실제 데이터인가요?</strong>
                  <p>A. 현재 구현된 화면을 그대로 사용하되, 화면에 드러나는 식별 정보와 연락처 성격의 값은 마스킹했습니다.</p>
                </div>
                <div class="faq-item">
                  <strong>Q. 문서는 어떻게 갱신하나요?</strong>
                  <p>A. HTML 원본을 다시 생성한 뒤, 같은 스크립트로 PDF를 재출력하면 됩니다. 화면이 바뀌면 스크린샷도 함께 갱신합니다.</p>
                </div>
                <div class="faq-item">
                  <strong>Q. 운영 시 주의할 점은 무엇인가요?</strong>
                  <p>A. 삭제, 상태 변경, 승인 처리는 실제 데이터에 영향을 주므로 권한과 이력 정책을 먼저 확인해야 합니다.</p>
                </div>
                <div class="faq-item">
                  <strong>Q. 이 문서의 사용 범위는 어디까지인가요?</strong>
                  <p>A. 현재 구현된 전체 메뉴를 기준으로 한 통합 안내서이며, 신규 메뉴가 추가되면 모듈별 섹션을 확장합니다.</p>
                </div>
              </div>
              <p class="footnote">문서 끝.</p>
            </section>
          </main>
        </div>
      </div>
      <div class="print-footer">인Pharmy ERP 통합 사용자 안내서</div>
    </body>
  </html>`;
}

async function captureScreenshots() {
  await mkdir(assetsDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: chromiumPath
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1600 },
    deviceScaleFactor: 1
  });

  const loginPage = await context.newPage();
  await loginPage.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await loginPage.evaluate(async () => {
    await fetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        loginId: "admin",
        password: "ChangeMe123!",
        callbackUrl: "/dashboard"
      })
    });
  });

  const routesToCapture = [...pages];

  for (const item of routesToCapture) {
    const page = await context.newPage();
    await page.goto(`${baseUrl}${item.route}`, { waitUntil: "networkidle" });

    if (item.route === "/dashboard") {
      await page.waitForSelector(".dashboard-title", { timeout: 20000 });
      await page.screenshot({ path: path.join(assetsDir, item.file), fullPage: true });
      await page.close();
      continue;
    }

    if (item.route === "/settings/users") {
      await page.waitForSelector(".approval-panel", { timeout: 20000 });
      await page.addStyleTag({
        content: `
          .approval-row p { filter: blur(3px); }
          .approval-row select { filter: blur(3px); }
        `
      });
      await page.screenshot({ path: path.join(assetsDir, item.file), fullPage: false });
      await page.close();
      continue;
    }

    await page.waitForSelector(".erp-page, .dashboard-page", { timeout: 20000 });
    await page.waitForSelector(".data-table tbody tr", { timeout: 20000 }).catch(() => null);

    if (await page.locator(".data-table tbody tr").count()) {
      const detailButton = page.locator(".table-actions button[title='상세']").first();
      if (await detailButton.count()) {
        await detailButton.click().catch(() => null);
        await page.waitForTimeout(600);
      }
    }

    await page.addStyleTag({
      content: `
        .entity-cell span { filter: blur(3px); }
        .erp-data-table tbody td:nth-child(4) { filter: blur(3px); }
        .detail-list dd { filter: blur(3px); }
      `
    });
    await page.screenshot({ path: path.join(assetsDir, item.file), fullPage: false });
    await page.close();
  }

  await browser.close();
}

async function main() {
  await mkdir(outDir, { recursive: true });
  await captureScreenshots();
  const html = buildHtml(pages);
  await writeFile(htmlPath, html, "utf8");

  const browser = await chromium.launch({
    headless: true,
    executablePath: chromiumPath
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1800 },
    deviceScaleFactor: 1
  });
  await page.goto(`file://${htmlPath}`, { waitUntil: "load" });
  await page.pdf({
    path: pdfPath,
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate:
      '<div style="width:100%; font-size:10px; color:#5f6d80; padding:0 14mm; display:flex; justify-content:space-between; align-items:center; box-sizing:border-box;"><span>인Pharmy ERP 통합 사용자 안내서</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "16mm", right: "14mm", bottom: "22mm", left: "14mm" }
  });
  await browser.close();

  process.stdout.write(JSON.stringify({ htmlPath, pdfPath, assetsDir }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
