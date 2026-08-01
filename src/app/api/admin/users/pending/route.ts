import { NextResponse } from "next/server";
import { requireMaster } from "@/lib/server/authz";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const auth = await requireMaster();
  if ("error" in auth) return auth.error;

  const users = await prisma.user.findMany({
    where: { accountStatus: "pending", deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      loginId: true,
      email: true,
      phone: true,
      requestedRole: true,
      accountStatus: true,
      positionTitle: true,
      organizationName: true,
      requestReason: true,
      createdAt: true,
      branch: { select: { id: true, name: true } }
    }
  });

  return NextResponse.json({ users });
}
