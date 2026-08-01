import { RefreshCw, Sparkles } from "lucide-react";
import type { AISummaryCardProps } from "@/types/dashboard";

export function AISummaryCard({ sections, summaryLines = [], generatedAt, isRefreshing, errorMessage, onRefresh }: AISummaryCardProps) {
  const formattedDate = generatedAt
    ? new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Seoul"
      }).format(new Date(generatedAt))
    : undefined;

  return (
    <section className="ai-card">
      <div className="ai-card-header">
        <h2 className="ai-card-title">
          <Sparkles size={19} />
          AI 요약
        </h2>
        {onRefresh ? (
          <button className="ai-refresh-button" type="button" onClick={onRefresh} disabled={isRefreshing} aria-label="AI 요약 새로고침">
            <RefreshCw size={16} className={isRefreshing ? "spinning" : undefined} />
          </button>
        ) : null}
      </div>
      {errorMessage ? <p className="ai-error">{errorMessage}</p> : null}
      <div className="ai-sections">
        {sections.length
          ? sections.map((section) => (
              <article className="ai-section" key={section.title}>
                <h3>{section.title}</h3>
                <ul>
                  {section.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </article>
            ))
          : summaryLines.map((line) => <p key={line}>{line}</p>)}
      </div>
      {formattedDate ? <div className="generated-at">업데이트 {formattedDate}</div> : null}
    </section>
  );
}
