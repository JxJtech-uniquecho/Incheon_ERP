import { NextResponse } from "next/server";
import { requireSession } from "@/lib/server/authz";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const user = auth.user;

  await prisma.user.update({ where: { id: user.id }, data: { lastActivityAt: new Date() } });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    loginId: user.loginId,
    role: user.role,
    branchId: user.branchId,
    branchName: user.branch?.name ?? null,
    accountStatus: user.accountStatus
  });
}
