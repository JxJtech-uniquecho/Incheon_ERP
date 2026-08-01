import type { RecentTicket, TicketPriority } from "@/types/dashboard";

type RecentTicketsTableProps = {
  items: RecentTicket[];
};

const priorityClass: Record<TicketPriority, string> = {
  긴급: "priority-urgent",
  높음: "priority-high",
  보통: "priority-normal",
  낮음: ""
};

export function RecentTicketsTable({ items }: RecentTicketsTableProps) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">최근 업무요청</h2>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>접수일</th>
              <th>유형</th>
              <th>요청자</th>
              <th>제목</th>
              <th>담당자</th>
              <th>상태</th>
              <th>우선순위</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.createdAt}</td>
                <td>{item.ticketType}</td>
                <td>{item.requesterName}</td>
                <td>{item.title}</td>
                <td>{item.assignedUserName}</td>
                <td>
                  <span className="status-pill">{item.status}</span>
                </td>
                <td>
                  <span className={`status-pill ${priorityClass[item.priority]}`}>{item.priority}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
