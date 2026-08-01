import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const roles = new Set(["master", "submaster", "user"]);

function text(value: unknown) {
  return String(value ?? "").trim();
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = text(body.name);
  const phone = text(body.phone);
  const loginId = text(body.loginId);
  const password = String(body.password ?? "");
  const passwordConfirm = String(body.passwordConfirm ?? "");
  const branchId = text(body.branchId);
  const requestedRole = text(body.requestedRole);
  const email = text(body.email) || null;
  const positionTitle = text(body.positionTitle) || null;
  const organizationName = text(body.organizationName) || null;
  const requestReason = text(body.requestReason) || null;
  const privacyConsent = body.privacyConsent === true;

  if (!name || !phone || !loginId || !password || !passwordConfirm || !branchId || !requestedRole) {
    return NextResponse.json({ message: "필수 입력값을 확인하세요." }, { status: 400 });
  }
  if (!/^[A-Za-z0-9_-]{4,30}$/.test(loginId)) {
    return NextResponse.json({ message: "ID는 영문, 숫자, _, - 조합 4~30자여야 합니다." }, { status: 400 });
  }
  if (password.length < 8 || password !== passwordConfirm) {
    return NextResponse.json({ message: "비밀번호는 8자 이상이며 확인값과 같아야 합니다." }, { status: 400 });
  }
  if (!roles.has(requestedRole)) {
    return NextResponse.json({ message: "요청 권한을 확인하세요." }, { status: 400 });
  }
  if (!privacyConsent) {
    return NextResponse.json({ message: "개인정보 처리 동의가 필요합니다." }, { status: 400 });
  }

  const [branch, sameLoginId, sameEmail] = await Promise.all([
    prisma.branch.findFirst({ where: { id: branchId, deletedAt: null }, select: { id: true } }),
    prisma.user.findUnique({ where: { loginId }, select: { id: true } }),
    email ? prisma.user.findUnique({ where: { email }, select: { id: true } }) : Promise.resolve(null)
  ]);

  if (!branch) return NextResponse.json({ message: "소속분회를 확인하세요." }, { status: 400 });
  if (sameLoginId) return NextResponse.json({ message: "이미 사용 중인 ID입니다." }, { status: 409 });
  if (sameEmail) return NextResponse.json({ message: "이미 사용 중인 이메일입니다." }, { status: 409 });

  await prisma.user.create({
    data: {
      name,
      phone,
      loginId,
      email,
      passwordHash: await hash(password, 12),
      branchId,
      requestedRole: requestedRole as "master" | "submaster" | "user",
      role: "user",
      accountStatus: "pending",
      positionTitle,
      organizationName,
      requestReason,
      privacyConsent
    }
  });

  return NextResponse.json({ ok: true, message: "회원가입 신청이 접수되었습니다." }, { status: 201 });
}
