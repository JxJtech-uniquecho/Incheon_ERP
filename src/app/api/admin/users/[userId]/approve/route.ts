import { NextRequest, NextResponse } from "next/server";
import { requireMaster } from "@/lib/server/authz";
import { prisma } from "@/lib/db/prisma";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

const roles = new Set(["master", "submaster", "user"]);

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireMaster();
  if ("error" in auth) return auth.error;

  const { userId } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { role?: string };
  const role = body.role && roles.has(body.role) ? body.role : undefined;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { requestedRole: true, accountStatus: true } });
  if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (user.accountStatus !== "pending") return NextResponse.json({ message: "승인 대기 계정만 승인할 수 있습니다." }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      role: (role ?? user.requestedRole) as "master" | "submaster" | "user",
      accountStatus: "approved",
      approvedById: auth.session.user.id,
      approvedAt: new Date(),
      rejectedReason: null
    },
    select: { id: true, name: true, loginId: true, role: true, accountStatus: true }
  });

  return NextResponse.json({ user: updated });
}
