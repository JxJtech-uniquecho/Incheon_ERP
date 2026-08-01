import type { MetricCardProps } from "@/types/dashboard";

export function MetricCard({ title, value, description, icon, trend }: MetricCardProps) {
  return (
    <article className="metric-card">
      <div>
        <div className="metric-top">
          <p className="metric-title">{title}</p>
          {icon ? <span className="metric-icon">{icon}</span> : null}
        </div>
        <p className="metric-value">{value}</p>
      </div>
      <div className="metric-footer">
        {trend ? <span className={`trend-${trend.type}`}>{trend.label}</span> : null}
        {description ? <span>{description}</span> : null}
      </div>
    </article>
  );
}
