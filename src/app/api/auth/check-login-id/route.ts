import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const loginId = request.nextUrl.searchParams.get("loginId")?.trim() ?? "";
  if (!/^[A-Za-z0-9_-]{4,30}$/.test(loginId)) {
    return NextResponse.json({ available: false, message: "ID는 영문, 숫자, _, - 조합 4~30자여야 합니다." }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { loginId }, select: { id: true } });
  return NextResponse.json({ available: !exists });
}
