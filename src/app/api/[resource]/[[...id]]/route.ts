import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/server/authz";
import { getErpRecord, listErpRecords, mutateErpRecord } from "@/lib/server/erp-repositories";
import type { ErpResource } from "@/types/erp";

const resources = new Set<ErpResource>([
  "members",
  "pharmacies",
  "branches",
  "committees",
  "dues",
  "payments",
  "documents",
  "meeting-docs",
  "press",
  "tickets",
  "approvals",
  "events",
  "settings",
  "audit-logs"
]);

type RouteContext = {
  params: Promise<{ resource: string; id?: string[] }>;
};

async function parse(context: RouteContext) {
  const params = await context.params;
  const resource = params.resource as ErpResource;
  const id = params.id?.[0];
  if (!resources.has(resource)) {
    return { error: NextResponse.json({ message: "Unknown resource" }, { status: 404 }) };
  }
  return { resource, id };
}

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const parsed = await parse(context);
  if (parsed.error) return parsed.error;
  if (parsed.id) {
    const item = await getErpRecord(parsed.resource, parsed.id);
    return item ? NextResponse.json({ item }) : NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json(await listErpRecords(parsed.resource, request.nextUrl.searchParams));
}

export async function POST(request: NextRequest, context: RouteContext) {
  const parsed = await parse(context);
  if (parsed.error) return parsed.error;
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  return NextResponse.json(await mutateErpRecord(parsed.resource, "POST", undefined, await request.json().catch(() => ({})), auth.session.user));
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const parsed = await parse(context);
  if (parsed.error) return parsed.error;
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  return NextResponse.json(await mutateErpRecord(parsed.resource, "PUT", parsed.id, await request.json().catch(() => ({})), auth.session.user));
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const parsed = await parse(context);
  if (parsed.error) return parsed.error;
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  return NextResponse.json(await mutateErpRecord(parsed.resource, "DELETE", parsed.id, {}, auth.session.user));
}
