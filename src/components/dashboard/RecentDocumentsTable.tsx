import type { RecentDocument } from "@/types/dashboard";

type RecentDocumentsTableProps = {
  items: RecentDocument[];
};

export function RecentDocumentsTable({ items }: RecentDocumentsTableProps) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">최근 문서</h2>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>등록일</th>
              <th>문서번호</th>
              <th>문서유형</th>
              <th>제목</th>
              <th>작성자</th>
              <th>결재상태</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.createdAt}</td>
                <td>{item.documentNo}</td>
                <td>{item.documentType}</td>
                <td>{item.title}</td>
                <td>{item.authorName}</td>
                <td>
                  <span className="status-pill">{item.approvalStatus}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
