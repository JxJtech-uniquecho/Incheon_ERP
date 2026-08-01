import { NextRequest, NextResponse } from "next/server";
import { requireMaster } from "@/lib/server/authz";
import { prisma } from "@/lib/db/prisma";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireMaster();
  if ("error" in auth) return auth.error;

  const { userId } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { reason?: string };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { accountStatus: true } });
  if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (user.accountStatus !== "pending") return NextResponse.json({ message: "승인 대기 계정만 반려할 수 있습니다." }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      accountStatus: "rejected",
      rejectedReason: body.reason?.trim() || "관리자 반려",
      approvedById: auth.session.user.id,
      approvedAt: new Date()
    },
    select: { id: true, name: true, loginId: true, accountStatus: true, rejectedReason: true }
  });

  return NextResponse.json({ user: updated });
}
