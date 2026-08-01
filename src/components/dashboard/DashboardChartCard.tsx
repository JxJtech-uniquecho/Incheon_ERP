import type { DashboardChartCardProps } from "@/types/dashboard";

export function DashboardChartCard({ title, tabs, activeTab, children }: DashboardChartCardProps) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">{title}</h2>
        {tabs ? (
          <div className="small-tabs" aria-label={`${title} 탭`}>
            {tabs.map((tab) => (
              <button className={`small-tab ${activeTab === tab ? "active" : ""}`} key={tab} type="button">
                {tab === "daily" ? "일별" : "누적"}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}
