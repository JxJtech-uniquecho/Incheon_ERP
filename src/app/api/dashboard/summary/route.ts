import { NextResponse } from "next/server";
import { getDashboardSummary, parsePeriod, resolveDashboardDateRange } from "@/lib/server/dashboard-summary";
import { requireSession } from "@/lib/server/authz";
import type { DashboardPeriod } from "@/types/dashboard";

const periods: DashboardPeriod[] = ["day", "week", "month", "custom"];

export async function GET(request: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const periodParam = searchParams.get("period") ?? "month";
  const period = periods.includes(periodParam as DashboardPeriod) ? parsePeriod(periodParam) : "month";
  const range = resolveDashboardDateRange(period, searchParams.get("startDate"), searchParams.get("endDate"));

  return NextResponse.json(await getDashboardSummary(range));
}
