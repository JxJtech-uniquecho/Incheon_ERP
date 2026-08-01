import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function getApprovedSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { status: "unauthenticated" as const };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      loginId: true,
      role: true,
      branchId: true,
      accountStatus: true,
      deletedAt: true,
      branch: { select: { id: true, name: true } }
    }
  });

  if (!user || user.deletedAt) {
    return { status: "unauthenticated" as const };
  }

  if (user.accountStatus !== "approved") {
    return { status: "forbidden" as const };
  }

  return { status: "ok" as const, session, user };
}

export async function requireSession() {
  const result = await getApprovedSessionUser();
  if (result.status === "unauthenticated") {
    return { error: NextResponse.json({ message: "Authentication required" }, { status: 401 }) };
  }
  if (result.status === "forbidden") {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }
  return { session: result.session, user: result.user };
}

export async function requireMaster() {
  const result = await requireSession();
  if ("error" in result) return result;
  if (result.user.role !== "master") {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }
  return result;
}
