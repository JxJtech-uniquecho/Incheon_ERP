import Link from "next/link";
import type { StaffPerformance } from "@/types/dashboard";

type StaffPerformanceCardProps = {
  items: StaffPerformance[];
};

export function StaffPerformanceCard({ items }: StaffPerformanceCardProps) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">담당자별 업무 처리 현황</h2>
      </div>
      <div className="staff-list">
        {items.map((item) => (
          <Link className="staff-row" href={`/tickets?staff=${encodeURIComponent(item.staffName)}`} key={item.staffName}>
            <div className="staff-name">
              <strong>{item.staffName}</strong>
              <span>{item.targetCount ? `목표 ${item.targetCount}건` : "목표 미설정"}</span>
            </div>
            <div className="staff-metric">
              <strong>{item.completedCount}건</strong>
              <span>완료</span>
            </div>
            <div className="staff-metric">
              <strong>{item.processingCount}건</strong>
              <span>처리중</span>
            </div>
            <div className="staff-metric">
              <strong className={item.delayedCount > 0 ? "danger" : ""}>{item.delayedCount}건</strong>
              <span>지연</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
