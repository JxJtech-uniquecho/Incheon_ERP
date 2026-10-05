import { NextResponse } from "next/server";
import { MistralError } from "@mistralai/mistralai/models/errors";
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
    if (error instanceof MistralError && error.statusCode === 429) {
      return NextResponse.json(
        { message: "AI 요약 서비스의 요청 한도를 초과했습니다. 잠시 후 다시 시도하거나 Mistral 계정의 사용 한도를 확인하세요." },
        { status: 429 }
      );
    }
    const message = error instanceof Error ? error.message : "AI 요약 생성 중 오류가 발생했습니다.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
