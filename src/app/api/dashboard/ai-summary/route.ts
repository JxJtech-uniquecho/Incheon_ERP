import { NextResponse } from "next/server";
import { requireSession } from "@/lib/server/authz";
import { parsePeriod, resolveDashboardDateRange } from "@/lib/server/dashboard-summary";
import { generateDashboardAiSummary } from "@/lib/server/mistral-dashboard";

type RequestBody = {
  period?: string;
  startDate?: string;
  endDate?: string;
  force?: boolean;
};

export async function POST(request: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const body = (await request.json().catch(() => ({}))) as RequestBody;
  const period = parsePeriod(body.period);
  const range = resolveDashboardDateRange(period, body.startDate, body.endDate);

  try {
    const result = await generateDashboardAiSummary(range, {
      force: Boolean(body.force),
      generatedById: auth.user.id
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI 요약 생성 중 오류가 발생했습니다.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
