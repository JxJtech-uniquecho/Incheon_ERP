import { DocumentType, PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const branchNames = ["중구", "동구", "미추홀구", "연수구", "남동구", "부평구", "계양구", "서구", "강화군", "옹진군"];
const staffNames = ["직원 A", "직원 B", "직원 C", "사무국장", "회계 담당", "민원 담당"];
const dueStatuses = ["완납", "부분납", "미납", "완납", "미납", "부분납", "완납", "미납", "완납", "부분납", "완납", "미납"];
const ticketStatuses = ["접수", "처리중", "완료", "보류", "접수", "처리중", "완료", "접수", "처리중", "완료", "보류", "접수"];
const approvalStatuses = ["대기", "진행", "검토중", "승인 완료", "반려", "대기", "진행", "검토중", "승인 완료", "대기"];

function day(dayOfMonth: number) {
  return new Date(Date.UTC(2026, 6, dayOfMonth));
}

function seedId(prefix: string, index: number) {
  return `seed_${prefix}_${String(index).padStart(2, "0")}`;
}

async function main() {
  const passwordHash = await hash("ChangeMe123!", 12);

  await prisma.user.upsert({
    where: { loginId: "admin" },
    update: {
      email: "admin@inpharmy.local",
      name: "ERP 테스트 관리자",
      passwordHash,
      role: "master",
      requestedRole: "master",
      accountStatus: "approved",
      privacyConsent: true,
      failedLoginCount: 0,
      lockedUntil: null,
      deletedAt: null
    },
    create: {
      loginId: "admin",
      email: "admin@inpharmy.local",
      name: "ERP 테스트 관리자",
      passwordHash,
      role: "master",
      requestedRole: "master",
      accountStatus: "approved",
      privacyConsent: true
    }
  });

  for (let index = 0; index < branchNames.length; index += 1) {
    const id = seedId("branch", index + 1);
    await prisma.branch.upsert({
      where: { id },
      update: {
        name: `${branchNames[index]} 분회`,
        status: "운영",
        chairName: `테스트 분회장 ${index + 1}`,
        memberCount: 20 + index,
        pharmacyCount: 12 + index,
        fields: { seed: true, code: id },
        deletedAt: null
      },
      create: {
        id,
        name: `${branchNames[index]} 분회`,
        status: "운영",
        chairName: `테스트 분회장 ${index + 1}`,
        memberCount: 20 + index,
        pharmacyCount: 12 + index,
        fields: { seed: true, code: id },
        createdAt: day(1)
      }
    });
  }

  for (let index = 1; index <= 12; index += 1) {
    const id = seedId("pharmacy", index);
    const branchId = seedId("branch", ((index - 1) % branchNames.length) + 1);
    await prisma.pharmacy.upsert({
      where: { id },
      update: {
        name: `테스트약국 ${index}`,
        address: `인천광역시 테스트로 ${100 + index}`,
        status: index % 6 === 0 ? "휴업" : "운영",
        pharmacyType: index % 3 === 0 ? "병원문전" : "동네약국",
        ownerName: `테스트 약사 ${index}`,
        phone: `032-555-${String(1000 + index).slice(1)}`,
        openedAt: day(Math.min(index, 28)),
        postalCode: `22${String(index).padStart(3, "0")}`,
        branchId,
        fields: { seed: true, 사업자등록번호: `000-00-${String(index).padStart(5, "0")}` },
        deletedAt: null
      },
      create: {
        id,
        name: `테스트약국 ${index}`,
        address: `인천광역시 테스트로 ${100 + index}`,
        status: index % 6 === 0 ? "휴업" : "운영",
        pharmacyType: index % 3 === 0 ? "병원문전" : "동네약국",
        ownerName: `테스트 약사 ${index}`,
        phone: `032-555-${String(1000 + index).slice(1)}`,
        openedAt: day(Math.min(index, 28)),
        postalCode: `22${String(index).padStart(3, "0")}`,
        branchId,
        fields: { seed: true, 사업자등록번호: `000-00-${String(index).padStart(5, "0")}` },
        createdAt: day(Math.min(index, 28))
      }
    });
  }

  for (let index = 1; index <= 12; index += 1) {
    const id = seedId("member", index);
    const branchId = seedId("branch", ((index - 1) % branchNames.length) + 1);
    const pharmacyId = seedId("pharmacy", index);
    await prisma.member.upsert({
      where: { id },
      update: {
        name: `테스트회원 ${index}`,
        licenseNo: `TEST-LIC-${String(index).padStart(5, "0")}`,
        status: index % 7 === 0 ? "휴면" : "정상",
        memberType: index % 4 === 0 ? "근무약사" : "개설약사",
        phone: `010-9000-${String(1000 + index).slice(1)}`,
        email: `seed.member${index}@example.test`,
        joinedAt: day(Math.min(index, 28)),
        branchId,
        pharmacyId,
        owner: staffNames[index % staffNames.length],
        fields: { seed: true, 테스트데이터: true },
        deletedAt: null
      },
      create: {
        id,
        name: `테스트회원 ${index}`,
        licenseNo: `TEST-LIC-${String(index).padStart(5, "0")}`,
        status: index % 7 === 0 ? "휴면" : "정상",
        memberType: index % 4 === 0 ? "근무약사" : "개설약사",
        phone: `010-9000-${String(1000 + index).slice(1)}`,
        email: `seed.member${index}@example.test`,
        joinedAt: day(Math.min(index, 28)),
        branchId,
        pharmacyId,
        owner: staffNames[index % staffNames.length],
        fields: { seed: true, 테스트데이터: true },
        createdAt: day(Math.min(index, 28))
      }
    });
  }

  for (let index = 1; index <= 12; index += 1) {
    const id = seedId("due", index);
    const status = dueStatuses[index - 1];
    const amountDue = 120000;
    const amountPaid = status === "완납" ? amountDue : status === "부분납" ? 60000 : 0;
    await prisma.due.upsert({
      where: { id },
      update: {
        memberId: seedId("member", index),
        branchId: seedId("branch", ((index - 1) % branchNames.length) + 1),
        title: `2026 테스트 정기회비 ${index}`,
        status,
        dueType: "정기회비",
        year: 2026,
        amountDue,
        amountPaid,
        paidAt: amountPaid > 0 ? day(index) : null,
        owner: staffNames[index % staffNames.length],
        fields: { seed: true, 납부월: "2026-07" },
        createdAt: day(index),
        deletedAt: null
      },
      create: {
        id,
        memberId: seedId("member", index),
        branchId: seedId("branch", ((index - 1) % branchNames.length) + 1),
        title: `2026 테스트 정기회비 ${index}`,
        status,
        dueType: "정기회비",
        year: 2026,
        amountDue,
        amountPaid,
        paidAt: amountPaid > 0 ? day(index) : null,
        owner: staffNames[index % staffNames.length],
        fields: { seed: true, 납부월: "2026-07" },
        createdAt: day(index)
      }
    });
  }

  for (let index = 1; index <= 12; index += 1) {
    const id = seedId("payment", index);
    const matched = index % 4 !== 0;
    await prisma.payment.upsert({
      where: { id },
      update: {
        branchId: seedId("branch", ((index - 1) % branchNames.length) + 1),
        title: `테스트 입금 ${index}`,
        status: matched ? "매칭완료" : "미매칭",
        depositor: `테스트입금자 ${index}`,
        account: "신한 000-000-000000",
        amount: matched ? 120000 : 70000,
        paidAt: day(index),
        owner: staffNames[index % staffNames.length],
        fields: { seed: true },
        createdAt: day(index),
        deletedAt: null
      },
      create: {
        id,
        branchId: seedId("branch", ((index - 1) % branchNames.length) + 1),
        title: `테스트 입금 ${index}`,
        status: matched ? "매칭완료" : "미매칭",
        depositor: `테스트입금자 ${index}`,
        account: "신한 000-000-000000",
        amount: matched ? 120000 : 70000,
        paidAt: day(index),
        owner: staffNames[index % staffNames.length],
        fields: { seed: true },
        createdAt: day(index)
      }
    });
  }

  for (let index = 1; index <= 10; index += 1) {
    const id = seedId("document", index);
    const documentType = index % 3 === 0 ? DocumentType.PRESS : index % 3 === 1 ? DocumentType.OFFICIAL : DocumentType.MEETING;
    await prisma.document.upsert({
      where: { id },
      update: {
        documentNo: `TEST-2026-${String(index).padStart(3, "0")}`,
        documentType,
        title: `테스트 문서 ${index}`,
        subtitle: "대시보드 테스트용 문서",
        status: approvalStatuses[index - 1],
        category: documentType === DocumentType.OFFICIAL ? "공문" : documentType === DocumentType.MEETING ? "회의자료" : "보도자료",
        owner: staffNames[index % staffNames.length],
        documentDate: day(index),
        fields: { seed: true },
        createdAt: day(index),
        deletedAt: null
      },
      create: {
        id,
        documentNo: `TEST-2026-${String(index).padStart(3, "0")}`,
        documentType,
        title: `테스트 문서 ${index}`,
        subtitle: "대시보드 테스트용 문서",
        status: approvalStatuses[index - 1],
        category: documentType === DocumentType.OFFICIAL ? "공문" : documentType === DocumentType.MEETING ? "회의자료" : "보도자료",
        owner: staffNames[index % staffNames.length],
        documentDate: day(index),
        fields: { seed: true },
        createdAt: day(index)
      }
    });
  }

  for (let index = 1; index <= 10; index += 1) {
    const id = seedId("approval", index);
    await prisma.approval.upsert({
      where: { id },
      update: {
        documentId: seedId("document", index),
        title: `테스트 결재 ${index}`,
        status: approvalStatuses[index - 1],
        approvalType: index % 2 === 0 ? "지출결의" : "문서결재",
        owner: staffNames[index % staffNames.length],
        requester: `테스트 요청자 ${index}`,
        comments: "테스트 결재 데이터",
        fields: { seed: true },
        createdAt: day(index),
        deletedAt: null
      },
      create: {
        id,
        documentId: seedId("document", index),
        title: `테스트 결재 ${index}`,
        status: approvalStatuses[index - 1],
        approvalType: index % 2 === 0 ? "지출결의" : "문서결재",
        owner: staffNames[index % staffNames.length],
        requester: `테스트 요청자 ${index}`,
        comments: "테스트 결재 데이터",
        fields: { seed: true },
        createdAt: day(index)
      }
    });
  }

  for (let index = 1; index <= 12; index += 1) {
    const id = seedId("ticket", index);
    await prisma.ticket.upsert({
      where: { id },
      update: {
        branchId: seedId("branch", ((index - 1) % branchNames.length) + 1),
        title: `테스트 업무요청 ${index}`,
        subtitle: "대시보드 테스트용 업무",
        status: ticketStatuses[index - 1],
        ticketType: index % 2 === 0 ? "민원" : "행정요청",
        requester: `테스트 요청자 ${index}`,
        priority: index % 5 === 0 ? "긴급" : index % 3 === 0 ? "높음" : "보통",
        owner: staffNames[index % staffNames.length],
        dueDate: day(Math.min(index + 3, 28)),
        fields: { seed: true },
        createdAt: day(index),
        deletedAt: null
      },
      create: {
        id,
        branchId: seedId("branch", ((index - 1) % branchNames.length) + 1),
        title: `테스트 업무요청 ${index}`,
        subtitle: "대시보드 테스트용 업무",
        status: ticketStatuses[index - 1],
        ticketType: index % 2 === 0 ? "민원" : "행정요청",
        requester: `테스트 요청자 ${index}`,
        priority: index % 5 === 0 ? "긴급" : index % 3 === 0 ? "높음" : "보통",
        owner: staffNames[index % staffNames.length],
        dueDate: day(Math.min(index + 3, 28)),
        fields: { seed: true },
        createdAt: day(index)
      }
    });
  }

  for (let index = 1; index <= 10; index += 1) {
    const id = seedId("event", index);
    await prisma.event.upsert({
      where: { id },
      update: {
        title: `테스트 행사 ${index}`,
        subtitle: index % 2 === 0 ? "분회 회의" : "연수 교육",
        status: index % 4 === 0 ? "완료" : "예정",
        eventType: index % 2 === 0 ? "회의" : "교육",
        owner: staffNames[index % staffNames.length],
        startsAt: day(index),
        place: `테스트 회의실 ${index}`,
        fields: { seed: true },
        createdAt: day(index),
        deletedAt: null
      },
      create: {
        id,
        title: `테스트 행사 ${index}`,
        subtitle: index % 2 === 0 ? "분회 회의" : "연수 교육",
        status: index % 4 === 0 ? "완료" : "예정",
        eventType: index % 2 === 0 ? "회의" : "교육",
        owner: staffNames[index % staffNames.length],
        startsAt: day(index),
        place: `테스트 회의실 ${index}`,
        fields: { seed: true },
        createdAt: day(index)
      }
    });
  }

  await prisma.auditLog.upsert({
    where: { id: "seed_audit_dashboard" },
    update: {
      actorEmail: "admin@inpharmy.local",
      actorRole: "master",
      action: "SEED",
      entityType: "system",
      entityId: "dashboard-seed",
      metadata: { message: "Dashboard deterministic seed data loaded", seed: true }
    },
    create: {
      id: "seed_audit_dashboard",
      actorEmail: "admin@inpharmy.local",
      actorRole: "master",
      action: "SEED",
      entityType: "system",
      entityId: "dashboard-seed",
      metadata: { message: "Dashboard deterministic seed data loaded", seed: true }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
