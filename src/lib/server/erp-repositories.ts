import { DocumentType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { ErpListResponse, ErpMutationResponse, ErpRecord, ErpResource } from "@/types/erp";

type MutationMethod = "POST" | "PUT" | "DELETE";
type Actor = {
  id?: string | null;
  email?: string | null;
  role?: string | null;
};

const branchNames: Record<string, string> = {
  branch_namdong: "남동구",
  branch_bupyeong: "부평구",
  branch_michuhol: "미추홀구",
  branch_yeonsu: "연수구",
  branch_seo: "서구"
};

function asFields(value: unknown): Record<string, string | number | boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, string | number | boolean>;
}

function dateText(value?: Date | string | null) {
  if (!value) return undefined;
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function dateValue(value?: string | null) {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function intValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function textFilter(q: string) {
  return { contains: q, mode: "insensitive" as const };
}

function pagination(params: URLSearchParams) {
  const page = Math.max(1, intValue(params.get("page"), 1));
  const pageSize = Math.min(100, Math.max(1, intValue(params.get("pageSize"), 50)));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

function commonWhere(params: URLSearchParams, aliases: { type?: string; year?: string; branchId?: string } = {}) {
  const status = params.get("status") ?? "전체";
  const type = params.get("type") ?? "전체";
  const year = params.get("year") ?? "전체";
  const branchId = params.get("branchId") ?? "전체";
  const where: Record<string, unknown> = { deletedAt: null };

  if (status !== "전체") where.status = status;
  if (type !== "전체" && aliases.type) where[aliases.type] = type;
  if (year !== "전체" && aliases.year) where[aliases.year] = intValue(year);
  if (branchId !== "전체" && aliases.branchId) where[aliases.branchId] = branchId;

  return where;
}

function listShape(items: ErpRecord[], total: number, page: number, pageSize: number): ErpListResponse {
  return { items, total, page, pageSize };
}

function branchLabel(id?: string | null, branch?: { name: string } | null) {
  if (branch?.name) return branch.name;
  if (!id) return undefined;
  return branchNames[id] ?? id;
}

function memberRecord(item: Prisma.MemberGetPayload<{ include: { branch: true; pharmacy: true } }>): ErpRecord {
  const fields = asFields(item.fields);
  const pharmacyName = item.pharmacy?.name ?? fields.약국명;
  return {
    id: item.id,
    title: item.name,
    subtitle: `면허 ${item.licenseNo ?? "-"} / ${pharmacyName ?? "-"}`,
    status: item.status,
    branchId: item.branchId ?? undefined,
    branchName: branchLabel(item.branchId, item.branch),
    type: item.memberType ?? undefined,
    owner: item.owner ?? undefined,
    updatedAt: dateText(item.updatedAt),
    fields: {
      면허번호: item.licenseNo ?? "-",
      휴대전화: item.phone ?? "-",
      이메일: item.email ?? "-",
      가입일: dateText(item.joinedAt) ?? "-",
      ...fields
    }
  };
}

function pharmacyRecord(item: Prisma.PharmacyGetPayload<{ include: { branch: true } }>): ErpRecord {
  const fields = asFields(item.fields);
  return {
    id: item.id,
    title: item.name,
    subtitle: item.address ?? "-",
    status: item.status,
    branchId: item.branchId ?? undefined,
    branchName: branchLabel(item.branchId, item.branch),
    type: item.pharmacyType ?? undefined,
    owner: item.ownerName ?? undefined,
    updatedAt: dateText(item.updatedAt),
    fields: {
      대표약사: item.ownerName ?? "-",
      전화번호: item.phone ?? "-",
      개설일: dateText(item.openedAt) ?? "-",
      우편번호: item.postalCode ?? "-",
      ...fields
    }
  };
}

function branchRecord(item: Prisma.BranchGetPayload<object>): ErpRecord {
  const fields = asFields(item.fields);
  return {
    id: item.id,
    title: item.name,
    subtitle: `회원 ${item.memberCount.toLocaleString()}명 / 약국 ${item.pharmacyCount.toLocaleString()}개소`,
    status: item.status,
    branchId: item.id,
    branchName: item.name,
    owner: item.chairName ?? undefined,
    updatedAt: dateText(item.updatedAt),
    fields: {
      분회장: item.chairName ?? "-",
      회원수: item.memberCount,
      약국수: item.pharmacyCount,
      ...fields
    }
  };
}

function committeeRecord(item: Prisma.CommitteeMemberGetPayload<object>): ErpRecord {
  const fields = asFields(item.fields);
  return {
    id: item.id,
    title: item.name,
    subtitle: `${item.position ?? "-"} / ${item.committee ?? item.committeeType ?? "-"}`,
    status: item.status,
    type: item.committeeType ?? undefined,
    owner: item.owner ?? undefined,
    updatedAt: dateText(item.updatedAt),
    fields: {
      직책: item.position ?? "-",
      위원회: item.committee ?? "-",
      임기: item.term ?? "-",
      연락처: item.contact ?? "-",
      ...fields
    }
  };
}

function dueRecord(item: Prisma.DueGetPayload<{ include: { branch: true; member: true } }>): ErpRecord {
  const fields = asFields(item.fields);
  return {
    id: item.id,
    title: item.title,
    subtitle: `${item.dueType ?? "회비"} / ${branchLabel(item.branchId, item.branch) ?? "-"}`,
    status: item.status,
    branchId: item.branchId ?? undefined,
    branchName: branchLabel(item.branchId, item.branch),
    year: item.year,
    amount: item.amountPaid,
    date: dateText(item.paidAt),
    updatedAt: dateText(item.updatedAt),
    fields: {
      회원명: item.member?.name ?? fields.회원명 ?? "-",
      회비구분: item.dueType ?? "-",
      납부금액: item.amountPaid,
      미납금액: Math.max(0, item.amountDue - item.amountPaid),
      ...fields
    }
  };
}

function paymentRecord(item: Prisma.PaymentGetPayload<{ include: { branch: true } }>): ErpRecord {
  const fields = asFields(item.fields);
  return {
    id: item.id,
    title: item.title,
    subtitle: `${item.account ?? "-"} / ${item.amount.toLocaleString()}원`,
    status: item.status,
    branchId: item.branchId ?? undefined,
    branchName: branchLabel(item.branchId, item.branch),
    amount: item.amount,
    date: dateText(item.paidAt),
    updatedAt: dateText(item.updatedAt),
    fields: {
      입금자: item.depositor ?? "-",
      계좌: item.account ?? "-",
      처리자: item.owner ?? "-",
      ...fields
    }
  };
}

function documentResourceType(resource: ErpResource) {
  if (resource === "meeting-docs") return DocumentType.MEETING;
  if (resource === "press") return DocumentType.PRESS;
  return DocumentType.OFFICIAL;
}

function documentRecord(item: Prisma.DocumentGetPayload<object>): ErpRecord {
  const fields = asFields(item.fields);
  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle ?? item.documentNo ?? "-",
    status: item.status,
    type: item.category ?? undefined,
    owner: item.owner ?? undefined,
    date: dateText(item.documentDate),
    updatedAt: dateText(item.updatedAt),
    fields: {
      문서번호: item.documentNo ?? "-",
      유형: item.category ?? "-",
      작성자: item.owner ?? "-",
      ...fields
    }
  };
}

function approvalRecord(item: Prisma.ApprovalGetPayload<{ include: { document: true } }>): ErpRecord {
  const fields = asFields(item.fields);
  return {
    id: item.id,
    title: item.title,
    subtitle: `${item.approvalType ?? "-"} / ${item.requester ?? "-"}`,
    status: item.status,
    type: item.approvalType ?? undefined,
    owner: item.owner ?? undefined,
    date: dateText(item.createdAt),
    updatedAt: dateText(item.updatedAt),
    fields: {
      요청자: item.requester ?? "-",
      의견: item.comments ?? "-",
      문서번호: item.document?.documentNo ?? "-",
      ...fields
    }
  };
}

function ticketRecord(item: Prisma.TicketGetPayload<{ include: { branch: true } }>): ErpRecord {
  const fields = asFields(item.fields);
  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle ?? `${item.requester ?? "-"} / ${item.ticketType ?? "-"}`,
    status: item.status,
    branchId: item.branchId ?? undefined,
    branchName: branchLabel(item.branchId, item.branch),
    type: item.ticketType ?? undefined,
    owner: item.owner ?? undefined,
    date: dateText(item.createdAt),
    updatedAt: dateText(item.updatedAt),
    fields: {
      요청자: item.requester ?? "-",
      우선순위: item.priority ?? "-",
      담당자: item.owner ?? "-",
      처리기한: dateText(item.dueDate) ?? "-",
      ...fields
    }
  };
}

function eventRecord(item: Prisma.EventGetPayload<object>): ErpRecord {
  const fields = asFields(item.fields);
  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle ?? `${dateText(item.startsAt) ?? "-"} / ${item.place ?? "-"}`,
    status: item.status,
    type: item.eventType ?? undefined,
    owner: item.owner ?? undefined,
    date: dateText(item.startsAt),
    updatedAt: dateText(item.updatedAt),
    fields: {
      시작일시: dateText(item.startsAt) ?? "-",
      장소: item.place ?? "-",
      등록자: item.owner ?? "-",
      ...fields
    }
  };
}

function settingRecord(item: Prisma.SettingGetPayload<object>): ErpRecord {
  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle ?? "-",
    status: item.status,
    type: item.settingType ?? undefined,
    owner: item.owner ?? undefined,
    updatedAt: dateText(item.updatedAt),
    fields: asFields(item.fields)
  };
}

function auditRecord(item: Prisma.AuditLogGetPayload<object>): ErpRecord {
  return {
    id: item.id,
    title: `${item.entityType} ${item.action}`,
    subtitle: `${item.actorEmail ?? "system"} / ${item.entityId ?? "-"}`,
    status: "기록됨",
    type: item.action,
    owner: item.actorEmail ?? undefined,
    date: dateText(item.createdAt),
    fields: {
      actorRole: item.actorRole ?? "-",
      entityType: item.entityType,
      entityId: item.entityId ?? "-",
      ip: item.ip ?? "-"
    }
  };
}

function searchWhere(resource: ErpResource, q: string) {
  if (!q) return undefined;
  const text = textFilter(q);
  switch (resource) {
    case "members":
      return { OR: [{ name: text }, { licenseNo: text }, { phone: text }, { email: text }, { owner: text }, { branch: { name: text } }, { pharmacy: { name: text } }] };
    case "pharmacies":
      return { OR: [{ name: text }, { address: text }, { ownerName: text }, { phone: text }, { branch: { name: text } }] };
    case "branches":
      return { OR: [{ name: text }, { chairName: text }] };
    case "committees":
      return { OR: [{ name: text }, { position: text }, { committee: text }, { owner: text }] };
    case "dues":
      return { OR: [{ title: text }, { dueType: text }, { member: { name: text } }, { branch: { name: text } }] };
    case "payments":
      return { OR: [{ title: text }, { depositor: text }, { account: text }, { owner: text }, { branch: { name: text } }] };
    case "documents":
    case "meeting-docs":
    case "press":
      return { OR: [{ title: text }, { subtitle: text }, { documentNo: text }, { category: text }, { owner: text }] };
    case "approvals":
      return { OR: [{ title: text }, { approvalType: text }, { owner: text }, { requester: text }, { document: { documentNo: text } }] };
    case "tickets":
      return { OR: [{ title: text }, { subtitle: text }, { ticketType: text }, { requester: text }, { owner: text }, { branch: { name: text } }] };
    case "events":
      return { OR: [{ title: text }, { subtitle: text }, { eventType: text }, { owner: text }, { place: text }] };
    case "settings":
      return { OR: [{ title: text }, { subtitle: text }, { settingType: text }, { owner: text }] };
    case "audit-logs":
      return { OR: [{ action: text }, { entityType: text }, { entityId: text }, { actorEmail: text }] };
  }
}

function mergeWhere(base: Record<string, unknown>, resource: ErpResource, params: URLSearchParams) {
  const q = (params.get("q") ?? "").trim();
  const qWhere = searchWhere(resource, q);
  return qWhere ? { AND: [base, qWhere] } : base;
}

export async function listErpRecords(resource: ErpResource, params: URLSearchParams): Promise<ErpListResponse> {
  const { page, pageSize, skip, take } = pagination(params);

  switch (resource) {
    case "members": {
      const where = mergeWhere(commonWhere(params, { type: "memberType", branchId: "branchId" }), resource, params);
      const [items, total] = await prisma.$transaction([
        prisma.member.findMany({ where, include: { branch: true, pharmacy: true }, orderBy: { updatedAt: "desc" }, skip, take }),
        prisma.member.count({ where })
      ]);
      return listShape(items.map(memberRecord), total, page, pageSize);
    }
    case "pharmacies": {
      const where = mergeWhere(commonWhere(params, { type: "pharmacyType", branchId: "branchId" }), resource, params);
      const [items, total] = await prisma.$transaction([
        prisma.pharmacy.findMany({ where, include: { branch: true }, orderBy: { updatedAt: "desc" }, skip, take }),
        prisma.pharmacy.count({ where })
      ]);
      return listShape(items.map(pharmacyRecord), total, page, pageSize);
    }
    case "branches": {
      const where = mergeWhere(commonWhere(params), resource, params);
      const [items, total] = await prisma.$transaction([
        prisma.branch.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take }),
        prisma.branch.count({ where })
      ]);
      return listShape(items.map(branchRecord), total, page, pageSize);
    }
    case "committees": {
      const where = mergeWhere(commonWhere(params, { type: "committeeType" }), resource, params);
      const [items, total] = await prisma.$transaction([
        prisma.committeeMember.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take }),
        prisma.committeeMember.count({ where })
      ]);
      return listShape(items.map(committeeRecord), total, page, pageSize);
    }
    case "dues": {
      const where = mergeWhere(commonWhere(params, { year: "year", branchId: "branchId" }), resource, params);
      const [items, total] = await prisma.$transaction([
        prisma.due.findMany({ where, include: { branch: true, member: true }, orderBy: { updatedAt: "desc" }, skip, take }),
        prisma.due.count({ where })
      ]);
      return listShape(items.map(dueRecord), total, page, pageSize);
    }
    case "payments": {
      const where = mergeWhere(commonWhere(params, { branchId: "branchId" }), resource, params);
      const [items, total] = await prisma.$transaction([
        prisma.payment.findMany({ where, include: { branch: true }, orderBy: { updatedAt: "desc" }, skip, take }),
        prisma.payment.count({ where })
      ]);
      return listShape(items.map(paymentRecord), total, page, pageSize);
    }
    case "documents":
    case "meeting-docs":
    case "press": {
      const where = mergeWhere({ ...commonWhere(params, { type: "category" }), documentType: documentResourceType(resource) }, resource, params);
      const [items, total] = await prisma.$transaction([
        prisma.document.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take }),
        prisma.document.count({ where })
      ]);
      return listShape(items.map(documentRecord), total, page, pageSize);
    }
    case "approvals": {
      const where = mergeWhere(commonWhere(params, { type: "approvalType" }), resource, params);
      const [items, total] = await prisma.$transaction([
        prisma.approval.findMany({ where, include: { document: true }, orderBy: { updatedAt: "desc" }, skip, take }),
        prisma.approval.count({ where })
      ]);
      return listShape(items.map(approvalRecord), total, page, pageSize);
    }
    case "tickets": {
      const where = mergeWhere(commonWhere(params, { type: "ticketType", branchId: "branchId" }), resource, params);
      const [items, total] = await prisma.$transaction([
        prisma.ticket.findMany({ where, include: { branch: true }, orderBy: { updatedAt: "desc" }, skip, take }),
        prisma.ticket.count({ where })
      ]);
      return listShape(items.map(ticketRecord), total, page, pageSize);
    }
    case "events": {
      const where = mergeWhere(commonWhere(params, { type: "eventType" }), resource, params);
      const [items, total] = await prisma.$transaction([
        prisma.event.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take }),
        prisma.event.count({ where })
      ]);
      return listShape(items.map(eventRecord), total, page, pageSize);
    }
    case "settings": {
      const where = mergeWhere(commonWhere(params, { type: "settingType" }), resource, params);
      const [items, total] = await prisma.$transaction([
        prisma.setting.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take }),
        prisma.setting.count({ where })
      ]);
      return listShape(items.map(settingRecord), total, page, pageSize);
    }
    case "audit-logs": {
      const where = mergeWhere({}, resource, params);
      const [items, total] = await prisma.$transaction([
        prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
        prisma.auditLog.count({ where })
      ]);
      return listShape(items.map(auditRecord), total, page, pageSize);
    }
  }
}

export async function getErpRecord(resource: ErpResource, id: string): Promise<ErpRecord | null> {
  switch (resource) {
    case "members": {
      const item = await prisma.member.findFirst({ where: { id, deletedAt: null }, include: { branch: true, pharmacy: true } });
      return item ? memberRecord(item) : null;
    }
    case "pharmacies": {
      const item = await prisma.pharmacy.findFirst({ where: { id, deletedAt: null }, include: { branch: true } });
      return item ? pharmacyRecord(item) : null;
    }
    case "branches": {
      const item = await prisma.branch.findFirst({ where: { id, deletedAt: null } });
      return item ? branchRecord(item) : null;
    }
    case "committees": {
      const item = await prisma.committeeMember.findFirst({ where: { id, deletedAt: null } });
      return item ? committeeRecord(item) : null;
    }
    case "dues": {
      const item = await prisma.due.findFirst({ where: { id, deletedAt: null }, include: { branch: true, member: true } });
      return item ? dueRecord(item) : null;
    }
    case "payments": {
      const item = await prisma.payment.findFirst({ where: { id, deletedAt: null }, include: { branch: true } });
      return item ? paymentRecord(item) : null;
    }
    case "documents":
    case "meeting-docs":
    case "press": {
      const item = await prisma.document.findFirst({ where: { id, deletedAt: null, documentType: documentResourceType(resource) } });
      return item ? documentRecord(item) : null;
    }
    case "approvals": {
      const item = await prisma.approval.findFirst({ where: { id, deletedAt: null }, include: { document: true } });
      return item ? approvalRecord(item) : null;
    }
    case "tickets": {
      const item = await prisma.ticket.findFirst({ where: { id, deletedAt: null }, include: { branch: true } });
      return item ? ticketRecord(item) : null;
    }
    case "events": {
      const item = await prisma.event.findFirst({ where: { id, deletedAt: null } });
      return item ? eventRecord(item) : null;
    }
    case "settings": {
      const item = await prisma.setting.findFirst({ where: { id, deletedAt: null } });
      return item ? settingRecord(item) : null;
    }
    case "audit-logs": {
      const item = await prisma.auditLog.findUnique({ where: { id } });
      return item ? auditRecord(item) : null;
    }
  }
}

async function writeAudit(tx: Prisma.TransactionClient, actor: Actor | undefined, action: string, entityType: ErpResource, entityId: string | undefined, before: unknown, after: unknown) {
  await tx.auditLog.create({
    data: {
      actorId: actor?.id ?? undefined,
      actorEmail: actor?.email ?? undefined,
      actorRole: actor?.role && ["SUPER_ADMIN", "OFFICE_ADMIN", "OFFICE_STAFF", "EXECUTIVE", "BRANCH_MANAGER"].includes(actor.role) ? (actor.role as never) : undefined,
      action,
      entityType,
      entityId,
      before: before === undefined ? undefined : (before as Prisma.InputJsonValue),
      after: after === undefined ? undefined : (after as Prisma.InputJsonValue),
      metadata: {}
    }
  });
}

function baseFields(body: Partial<ErpRecord>) {
  return (body.fields ?? {}) as Prisma.InputJsonObject;
}

export async function mutateErpRecord(resource: ErpResource, method: MutationMethod, id: string | undefined, body: Partial<ErpRecord>, actor?: Actor): Promise<ErpMutationResponse> {
  return prisma.$transaction(async (tx) => {
    const action = method === "POST" ? "CREATE" : method === "PUT" ? "UPDATE" : "DELETE";
    let before: unknown;
    let item: ErpRecord | undefined;

    if (method === "DELETE") {
      if (!id) return { ok: true, message: "삭제할 항목이 지정되지 않았습니다." };
      before = await readRaw(tx, resource, id);
      await softDelete(tx, resource, id);
      await writeAudit(tx, actor, action, resource, id, before, undefined);
      return { ok: true, message: "삭제 처리가 완료되었습니다." };
    }

    if (method === "PUT" && id) before = await readRaw(tx, resource, id);

    const saved = await upsertRecord(tx, resource, method, id, body);
    await writeAudit(tx, actor, action, resource, saved.id, before, saved.raw);
    item = saved.item;

    return { ok: true, item, message: method === "POST" ? "등록이 완료되었습니다." : "수정이 완료되었습니다." };
  });
}

async function readRaw(tx: Prisma.TransactionClient, resource: ErpResource, id: string) {
  switch (resource) {
    case "members": return tx.member.findUnique({ where: { id } });
    case "pharmacies": return tx.pharmacy.findUnique({ where: { id } });
    case "branches": return tx.branch.findUnique({ where: { id } });
    case "committees": return tx.committeeMember.findUnique({ where: { id } });
    case "dues": return tx.due.findUnique({ where: { id } });
    case "payments": return tx.payment.findUnique({ where: { id } });
    case "documents":
    case "meeting-docs":
    case "press": return tx.document.findUnique({ where: { id } });
    case "approvals": return tx.approval.findUnique({ where: { id } });
    case "tickets": return tx.ticket.findUnique({ where: { id } });
    case "events": return tx.event.findUnique({ where: { id } });
    case "settings": return tx.setting.findUnique({ where: { id } });
    case "audit-logs": return tx.auditLog.findUnique({ where: { id } });
  }
}

async function softDelete(tx: Prisma.TransactionClient, resource: ErpResource, id: string) {
  const data = { deletedAt: new Date() };
  switch (resource) {
    case "members": return tx.member.update({ where: { id }, data });
    case "pharmacies": return tx.pharmacy.update({ where: { id }, data });
    case "branches": return tx.branch.update({ where: { id }, data });
    case "committees": return tx.committeeMember.update({ where: { id }, data });
    case "dues": return tx.due.update({ where: { id }, data });
    case "payments": return tx.payment.update({ where: { id }, data });
    case "documents":
    case "meeting-docs":
    case "press": return tx.document.update({ where: { id }, data });
    case "approvals": return tx.approval.update({ where: { id }, data });
    case "tickets": return tx.ticket.update({ where: { id }, data });
    case "events": return tx.event.update({ where: { id }, data });
    case "settings": return tx.setting.update({ where: { id }, data });
    case "audit-logs": return tx.auditLog.delete({ where: { id } });
  }
}

async function upsertRecord(tx: Prisma.TransactionClient, resource: ErpResource, method: "POST" | "PUT", id: string | undefined, body: Partial<ErpRecord>) {
  const isUpdate = method === "PUT" && Boolean(id);
  const fields = baseFields(body);
  switch (resource) {
    case "members": {
      const data = {
        name: body.title ?? "새 회원",
        status: body.status ?? "정상",
        memberType: body.type,
        branchId: body.branchId,
        owner: body.owner,
        licenseNo: String(fields.면허번호 ?? fields.license ?? ""),
        phone: String(fields.휴대전화 ?? fields.phone ?? ""),
        email: String(fields.이메일 ?? fields.email ?? ""),
        fields
      };
      const raw = isUpdate ? await tx.member.update({ where: { id }, data, include: { branch: true, pharmacy: true } }) : await tx.member.create({ data, include: { branch: true, pharmacy: true } });
      return { id: raw.id, raw, item: memberRecord(raw) };
    }
    case "pharmacies": {
      const data = { name: body.title ?? "새 약국", address: body.subtitle, status: body.status ?? "운영", pharmacyType: body.type, branchId: body.branchId, ownerName: body.owner, phone: String(fields.전화번호 ?? fields.phone ?? ""), fields };
      const raw = isUpdate ? await tx.pharmacy.update({ where: { id }, data, include: { branch: true } }) : await tx.pharmacy.create({ data, include: { branch: true } });
      return { id: raw.id, raw, item: pharmacyRecord(raw) };
    }
    case "branches": {
      const data = { name: body.title ?? "새 분회", status: body.status ?? "운영", chairName: body.owner ?? String(fields.분회장 ?? fields.chair ?? ""), fields };
      const raw = isUpdate ? await tx.branch.update({ where: { id }, data }) : await tx.branch.create({ data: { id: `branch_${Date.now()}`, ...data } });
      return { id: raw.id, raw, item: branchRecord(raw) };
    }
    case "committees": {
      const data = { name: body.title ?? "새 임원", status: body.status ?? "임기중", committeeType: body.type, owner: body.owner, position: String(fields.직책 ?? fields.role ?? ""), term: String(fields.임기 ?? fields.term ?? ""), fields };
      const raw = isUpdate ? await tx.committeeMember.update({ where: { id }, data }) : await tx.committeeMember.create({ data });
      return { id: raw.id, raw, item: committeeRecord(raw) };
    }
    case "dues": {
      const amount = intValue(body.amount ?? fields.납부금액);
      const data = { title: body.title ?? "새 회비", status: body.status ?? "미납", dueType: body.type ?? String(fields.회비구분 ?? "정회원"), branchId: body.branchId, year: body.year ?? intValue(fields.year, 2026), amountDue: Math.max(amount, intValue(fields.미납금액) + amount), amountPaid: amount, paidAt: dateValue(body.date), owner: body.owner, fields };
      const raw = isUpdate ? await tx.due.update({ where: { id }, data, include: { branch: true, member: true } }) : await tx.due.create({ data, include: { branch: true, member: true } });
      return { id: raw.id, raw, item: dueRecord(raw) };
    }
    case "payments": {
      const data = { title: body.title ?? "새 입금", status: body.status ?? "미매칭", branchId: body.branchId, depositor: String(fields.입금자 ?? ""), account: String(fields.계좌 ?? body.subtitle ?? ""), amount: intValue(body.amount), paidAt: dateValue(body.date), owner: body.owner, fields };
      const raw = isUpdate ? await tx.payment.update({ where: { id }, data, include: { branch: true } }) : await tx.payment.create({ data, include: { branch: true } });
      return { id: raw.id, raw, item: paymentRecord(raw) };
    }
    case "documents":
    case "meeting-docs":
    case "press": {
      const data = { title: body.title ?? "새 문서", subtitle: body.subtitle, status: body.status ?? "작성중", documentType: documentResourceType(resource), category: body.type, owner: body.owner, documentNo: String(fields.문서번호 ?? fields.documentNo ?? ""), documentDate: dateValue(body.date), fields };
      const raw = isUpdate ? await tx.document.update({ where: { id }, data }) : await tx.document.create({ data });
      return { id: raw.id, raw, item: documentRecord(raw) };
    }
    case "approvals": {
      const data = { title: body.title ?? "새 결재", status: body.status ?? "대기", approvalType: body.type, owner: body.owner, requester: String(fields.요청자 ?? ""), comments: String(fields.의견 ?? fields.comment ?? ""), fields };
      const raw = isUpdate ? await tx.approval.update({ where: { id }, data, include: { document: true } }) : await tx.approval.create({ data, include: { document: true } });
      return { id: raw.id, raw, item: approvalRecord(raw) };
    }
    case "tickets": {
      const data = { title: body.title ?? "새 업무요청", subtitle: body.subtitle, status: body.status ?? "접수", ticketType: body.type, branchId: body.branchId, owner: body.owner, requester: String(fields.요청자 ?? fields.requester ?? ""), priority: String(fields.우선순위 ?? ""), dueDate: dateValue(String(fields.처리기한 ?? fields.dueDate ?? "")), fields };
      const raw = isUpdate ? await tx.ticket.update({ where: { id }, data, include: { branch: true } }) : await tx.ticket.create({ data, include: { branch: true } });
      return { id: raw.id, raw, item: ticketRecord(raw) };
    }
    case "events": {
      const data = { title: body.title ?? "새 일정", subtitle: body.subtitle, status: body.status ?? "예정", eventType: body.type, owner: body.owner, startsAt: dateValue(body.date), place: String(fields.장소 ?? fields.place ?? ""), fields };
      const raw = isUpdate ? await tx.event.update({ where: { id }, data }) : await tx.event.create({ data });
      return { id: raw.id, raw, item: eventRecord(raw) };
    }
    case "settings": {
      const data = { title: body.title ?? "새 설정", subtitle: body.subtitle, status: body.status ?? "활성", settingType: body.type, owner: body.owner, fields };
      const raw = isUpdate ? await tx.setting.update({ where: { id }, data }) : await tx.setting.create({ data });
      return { id: raw.id, raw, item: settingRecord(raw) };
    }
    case "audit-logs": {
      throw new Error("감사로그는 직접 수정할 수 없습니다.");
    }
  }
}
