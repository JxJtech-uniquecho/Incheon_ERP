import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const branches = await prisma.branch.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  return NextResponse.json({
    items: branches.map((branch) => ({ id: branch.id, title: branch.name }))
  });
}
