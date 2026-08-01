"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Check, Eye, Plus, Search, Trash2, X } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatusBadge } from "@/components/erp/StatusBadge";
import type { ErpListResponse, ErpMutationResponse, ErpPageConfig, ErpRecord } from "@/types/erp";

type CrudWorkspaceProps = {
  config: ErpPageConfig;
};

function valueText(value: unknown) {
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "boolean") return value ? "예" : "아니오";
  return String(value ?? "-");
}

export function CrudWorkspace({ config }: CrudWorkspaceProps) {
  const [items, setItems] = useState<ErpRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>(() => Object.fromEntries(config.filters.map((filter) => [filter.key, "전체"])));
  const [selected, setSelected] = useState<ErpRecord | null>(null);
  const [editing, setEditing] = useState<ErpRecord | null>(null);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [confirming, setConfirming] = useState<ErpRecord | null>(null);
  const [toast, setToast] = useState("DB API 연결됨");
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: "1", pageSize: "50" });
    if (query.trim()) params.set("q", query.trim());
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "전체") params.set(key, value);
    });

    try {
      const response = await fetch(`/api/${config.resource}?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`목록 조회 실패 (${response.status})`);
      const data = (await response.json()) as ErpListResponse;
      setItems(data.items);
      setTotal(data.total);
      setSelected((current) => (current ? data.items.find((item) => item.id === current.id) ?? current : current));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "목록 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [config.resource, filters, query]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadItems();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadItems]);

  const totals = useMemo(() => {
    const completed = items.filter((item) => ["정상", "운영", "납부완료", "매칭완료", "승인 완료", "완료", "활성", "공개", "배포완료"].includes(item.status)).length;
    const pending = items.filter((item) => ["접수", "대기", "결재 대기", "검토중", "작성중", "부분납부", "미매칭", "보류", "미납"].includes(item.status)).length;
    const amount = items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
    return { completed, pending, amount };
  }, [items]);

  function openCreate() {
    setEditing(null);
    setCreateOpen(true);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fields = Object.fromEntries(
      config.formFields.map((field) => {
        const rawValue = formData.get(field.key);
        return [field.label, field.type === "number" ? Number(rawValue || 0) : String(rawValue || "")];
      })
    );
    const title = String(formData.get("title") || "새 항목");
    const status = String(formData.get("status") || "등록");
    const owner = String(formData.get("owner") || "사무국");
    const amount = Number(formData.get("amount") || 0);
    const payload: Partial<ErpRecord> = {
      title,
      subtitle: String(formData.get("subtitle") || editing?.subtitle || "DB 화면에서 입력됨"),
      status,
      branchId: editing?.branchId,
      branchName: editing?.branchName,
      year: editing?.year ?? 2026,
      type: editing?.type,
      owner,
      amount: amount > 0 ? amount : editing?.amount,
      date: String(formData.get("date") || editing?.date || "2026-07-01"),
      fields: {
        ...(editing?.fields ?? {}),
        ...fields
      }
    };

    const url = editing ? `/api/${config.resource}/${editing.id}` : `/api/${config.resource}`;
    const method = editing ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`저장 실패 (${response.status})`);
      const data = (await response.json()) as ErpMutationResponse;
      setToast(data.message);
      setCreateOpen(false);
      setEditing(null);
      if (data.item) setSelected(data.item);
      await loadItems();
    } catch (saveError) {
      setToast(saveError instanceof Error ? saveError.message : "저장 중 오류가 발생했습니다.");
    }
  }

  async function deleteItem(item: ErpRecord) {
    try {
      const response = await fetch(`/api/${config.resource}/${item.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`삭제 실패 (${response.status})`);
      const data = (await response.json()) as ErpMutationResponse;
      setConfirming(null);
      if (selected?.id === item.id) setSelected(null);
      setToast(data.message);
      await loadItems();
    } catch (deleteError) {
      setToast(deleteError instanceof Error ? deleteError.message : "삭제 중 오류가 발생했습니다.");
    }
  }

  async function cycleStatus(item: ErpRecord) {
    const status = item.status === "완료" || item.status === "정상" || item.status === "운영" ? "보류" : "완료";
    try {
      const response = await fetch(`/api/${config.resource}/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, status })
      });
      if (!response.ok) throw new Error(`상태 변경 실패 (${response.status})`);
      const data = (await response.json()) as ErpMutationResponse;
      if (data.item) setSelected(data.item);
      setToast(`${config.statusAction}: ${status}`);
      await loadItems();
    } catch (statusError) {
      setToast(statusError instanceof Error ? statusError.message : "상태 변경 중 오류가 발생했습니다.");
    }
  }

  return (
    <AdminLayout activeModule={config.activeModule} activeMenu={config.activeMenu}>
      <div className="erp-page">
        <header className="erp-header">
          <div>
            <p className="eyebrow">{config.eyebrow}</p>
            <h1 className="dashboard-title">{config.title}</h1>
            <p className="dashboard-description">{config.description}</p>
          </div>
          <div className="action-toolbar">
            <span className="mock-toast">{toast}</span>
            <button className="primary-button icon-button-text" type="button" onClick={openCreate}>
              <Plus size={16} />
              {config.primaryAction}
            </button>
          </div>
        </header>

        <section className="erp-kpi-grid" aria-label="요약 지표">
          <div className="mini-kpi"><span>전체</span><strong>{total.toLocaleString()}</strong></div>
          <div className="mini-kpi"><span>현재 페이지</span><strong>{items.length.toLocaleString()}</strong></div>
          <div className="mini-kpi"><span>완료/정상</span><strong>{totals.completed.toLocaleString()}</strong></div>
          <div className="mini-kpi"><span>확인 필요</span><strong>{totals.pending.toLocaleString()}</strong></div>
          <div className="mini-kpi"><span>금액 합계</span><strong>{totals.amount ? `${totals.amount.toLocaleString()}원` : "-"}</strong></div>
        </section>

        <section className="filter-bar" aria-label="검색 및 필터">
          <label className="search-field">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름, 문서번호, 담당자, 주소 검색" />
          </label>
          {config.filters.map((filter) => (
            <label className="select-field" key={filter.key}>
              <span>{filter.label}</span>
              <select value={filters[filter.key] ?? "전체"} onChange={(event) => setFilters((current) => ({ ...current, [filter.key]: event.target.value }))}>
                {filter.options.map((option) => (
                  <option key={option} value={option}>
                    {option.startsWith("branch_") ? { branch_namdong: "남동구", branch_bupyeong: "부평구", branch_michuhol: "미추홀구", branch_yeonsu: "연수구", branch_seo: "서구" }[option] : option}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button className="secondary-button" type="button" onClick={() => { setQuery(""); setFilters(Object.fromEntries(config.filters.map((filter) => [filter.key, "전체"]))); }}>
            초기화
          </button>
        </section>

        <section className="workspace-grid">
          <div className="card erp-table-card">
            {isLoading ? (
              <div className="empty-state">
                <strong>목록을 불러오는 중입니다</strong>
                <p>PostgreSQL 데이터베이스에서 최신 데이터를 조회하고 있습니다.</p>
              </div>
            ) : error ? (
              <div className="empty-state">
                <strong>목록 조회 실패</strong>
                <p>{error}</p>
                <button className="secondary-button" type="button" onClick={() => void loadItems()}>다시 시도</button>
              </div>
            ) : items.length ? (
              <div className="table-scroll">
                <table className="data-table erp-data-table">
                  <thead>
                    <tr>
                      {config.columns.map((column) => (
                        <th key={column.key} style={{ width: column.width }} className={column.align === "right" ? "numeric" : ""}>{column.label}</th>
                      ))}
                      <th className="table-actions">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        {config.columns.map((column) => (
                          <td key={column.key} className={column.align === "right" ? "numeric" : ""}>
                            {column.render ? column.render(item) : column.key === "title" ? <div className="entity-cell"><strong>{item.title}</strong><span>{item.subtitle}</span></div> : valueText(item[column.key as keyof ErpRecord])}
                          </td>
                        ))}
                        <td className="table-actions">
                          <button className="icon-only" type="button" title="상세" onClick={() => setSelected(item)}><Eye size={16} /></button>
                          <button className="icon-only" type="button" title={config.statusAction} onClick={() => cycleStatus(item)}><Check size={16} /></button>
                          <button className="icon-only danger-button" type="button" title={config.destructiveAction} onClick={() => setConfirming(item)}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <strong>{config.emptyTitle}</strong>
                <p>{config.emptyDescription}</p>
                <button className="secondary-button" type="button" onClick={() => { setQuery(""); setFilters(Object.fromEntries(config.filters.map((filter) => [filter.key, "전체"]))); }}>필터 초기화</button>
              </div>
            )}
          </div>

          <aside className={`detail-drawer ${selected ? "open" : ""}`}>
            {selected ? (
              <>
                <div className="drawer-header">
                  <div>
                    <span className="drawer-label">상세</span>
                    <h2>{selected.title}</h2>
                    <p>{selected.subtitle}</p>
                  </div>
                  <button className="icon-only" type="button" title="닫기" onClick={() => setSelected(null)}><X size={17} /></button>
                </div>
                <StatusBadge status={selected.status} />
                <dl className="detail-list">
                  <div><dt>담당자</dt><dd>{selected.owner ?? "-"}</dd></div>
                  <div><dt>분회</dt><dd>{selected.branchName ?? "-"}</dd></div>
                  <div><dt>유형</dt><dd>{selected.type ?? "-"}</dd></div>
                  <div><dt>기준일</dt><dd>{selected.updatedAt ?? selected.date ?? "-"}</dd></div>
                  {Object.entries(selected.fields).map(([key, value]) => (
                    <div key={key}><dt>{key}</dt><dd>{valueText(value)}</dd></div>
                  ))}
                </dl>
                <div className="drawer-actions">
                  <button className="primary-button" type="button" onClick={() => { setEditing(selected); setCreateOpen(true); }}>수정</button>
                  <button className="secondary-button" type="button" onClick={() => cycleStatus(selected)}>{config.statusAction}</button>
                </div>
              </>
            ) : (
              <div className="drawer-placeholder">목록에서 항목을 선택하면 상세 정보가 표시됩니다.</div>
            )}
          </aside>
        </section>
      </div>

      {isCreateOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="form-modal" onSubmit={submitForm}>
            <div className="modal-header">
              <h2>{editing ? "수정" : config.primaryAction}</h2>
              <button className="icon-only" type="button" title="닫기" onClick={() => { setCreateOpen(false); setEditing(null); }}><X size={17} /></button>
            </div>
            <div className="form-grid">
              {config.formFields.map((field) => (
                <label key={field.key}>
                  <span>{field.label}</span>
                  <input name={field.key} type={field.type ?? "text"} defaultValue={field.key === "title" ? editing?.title : field.key === "subtitle" ? editing?.subtitle : field.key === "status" ? editing?.status : field.key === "owner" ? editing?.owner : field.key === "amount" ? editing?.amount : field.key === "date" ? editing?.date : ""} />
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => { setCreateOpen(false); setEditing(null); }}>취소</button>
              <button className="primary-button" type="submit">저장</button>
            </div>
          </form>
        </div>
      ) : null}

      {confirming ? (
        <div className="modal-backdrop" role="presentation">
          <div className="confirm-dialog">
            <h2>{config.destructiveAction}</h2>
            <p>{confirming.title} 항목을 삭제 처리합니다. 데이터는 운영 이력 보존을 위해 soft delete로 보관됩니다.</p>
            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => setConfirming(null)}>취소</button>
              <button className="primary-button danger-confirm" type="button" onClick={() => deleteItem(confirming)}>처리</button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
