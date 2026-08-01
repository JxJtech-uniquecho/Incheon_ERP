"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, RefreshCcw, UserCheck, X } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";

type PendingUser = {
  id: string;
  name: string | null;
  loginId: string;
  email: string | null;
  phone: string | null;
  requestedRole: "master" | "submaster" | "user";
  accountStatus: string;
  positionTitle: string | null;
  organizationName: string | null;
  requestReason: string | null;
  createdAt: string;
  branch: { id: string; name: string } | null;
};

const roleLabels = {
  master: "최고 관리자",
  submaster: "분회/사무국 관리자",
  user: "일반 사용자"
};

export default function UserApprovalPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/users/pending", { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as { users?: PendingUser[]; message?: string };
      if (!response.ok) throw new Error(payload.message ?? "사용자 목록을 불러오지 못했습니다.");
      setUsers(payload.users ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "사용자 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadUsers();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  async function decide(userId: string, action: "approve" | "reject", role?: string) {
    setToast("");
    setError("");
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "approve" ? { role } : { reason: "관리자 반려" })
      });
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) throw new Error(payload.message ?? "처리하지 못했습니다.");
      setUsers((current) => current.filter((user) => user.id !== userId));
      setToast(action === "approve" ? "계정을 승인했습니다." : "계정을 반려했습니다.");
    } catch (decideError) {
      setError(decideError instanceof Error ? decideError.message : "처리하지 못했습니다.");
    }
  }

  return (
    <AdminLayout activeModule="settings" activeMenu="users">
      <div className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">시스템</p>
            <h1 className="dashboard-title">사용자 승인</h1>
            <p className="dashboard-description">회원가입 신청 계정을 검토하고 최종 권한을 부여합니다.</p>
          </div>
          <button className="secondary-button" type="button" onClick={() => void loadUsers()}>
            <RefreshCcw size={16} />
            새로고침
          </button>
        </header>

        {toast ? <p className="form-success">{toast}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        <section className="approval-panel" aria-label="승인 대기 사용자">
          <div className="approval-panel-header">
            <UserCheck size={18} />
            <h2>승인 대기</h2>
            <span>{users.length.toLocaleString()}건</span>
          </div>
          {isLoading ? <p className="dashboard-state">사용자 목록을 불러오는 중입니다.</p> : null}
          {!isLoading && users.length === 0 ? <p className="dashboard-state">승인 대기 계정이 없습니다.</p> : null}
          <div className="approval-list">
            {users.map((user) => (
              <article className="approval-row" key={user.id}>
                <div>
                  <h3>{user.name ?? user.loginId}</h3>
                  <p>
                    {user.loginId} · {user.branch?.name ?? "분회 미지정"} · {roleLabels[user.requestedRole]}
                  </p>
                  <p>{[user.positionTitle, user.organizationName, user.phone, user.email].filter(Boolean).join(" · ")}</p>
                  {user.requestReason ? <p className="approval-reason">{user.requestReason}</p> : null}
                </div>
                <div className="approval-actions">
                  <select aria-label="승인 권한" defaultValue={user.requestedRole} id={`role-${user.id}`}>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => void decide(user.id, "approve", (document.getElementById(`role-${user.id}`) as HTMLSelectElement | null)?.value)}
                  >
                    <Check size={16} />
                    승인
                  </button>
                  <button className="danger-button" type="button" onClick={() => void decide(user.id, "reject")}>
                    <X size={16} />
                    반려
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
