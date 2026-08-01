const toneMap: Record<string, string> = {
  정상: "success",
  운영: "success",
  운영중: "success",
  활성: "success",
  납부완료: "success",
  매칭완료: "success",
  공개: "success",
  배포완료: "success",
  완료: "success",
  "승인 완료": "success",
  예정: "info",
  모집중: "info",
  처리중: "info",
  진행: "info",
  접수: "warning",
  대기: "warning",
  "결재 대기": "warning",
  검토중: "warning",
  작성중: "warning",
  부분납부: "warning",
  미납: "danger",
  미매칭: "danger",
  보류: "danger",
  폐업: "danger",
  탈퇴처리: "danger",
  반려: "danger"
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`status-badge ${toneMap[status] ?? "neutral"}`}>{status}</span>;
}
