import type { BranchStat } from "@/types/dashboard";

type BranchStatsTableProps = {
  items: BranchStat[];
};

export function BranchStatsTable({ items }: BranchStatsTableProps) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">분회별 회원·회비 현황</h2>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>분회</th>
              <th className="numeric">회원 수</th>
              <th className="numeric">정상 약국</th>
              <th className="numeric">납부율</th>
              <th className="numeric">미납</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.branchName}>
                <td>{item.branchName}</td>
                <td className="numeric">{item.memberCount.toLocaleString()}명</td>
                <td className="numeric">{item.pharmacyCount.toLocaleString()}개소</td>
                <td className="numeric">{item.paymentRate}%</td>
                <td className="numeric">{item.unpaidCount.toLocaleString()}명</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
