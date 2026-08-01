import { Mistral } from "@mistralai/mistralai";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  getDashboardAggregate,
  sectionTitles,
  type DashboardAiPayload,
  type DashboardDateRange
} from "@/lib/server/dashboard-summary";
import type { DashboardAiSummarySection } from "@/types/dashboard";

const model = "mistral-small-latest";

type GenerateOptions = {
  force?: boolean;
  generatedById?: string;
};

type GenerateResult = {
  sections: DashboardAiSummarySection[];
  rawText: string;
  generatedAt: string;
  model: string;
  payloadHash: string;
  sourceSnapshot: DashboardAiPayload;
  cached: boolean;
};

function getMistralClient() {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY 환경변수가 설정되어 있지 않습니다.");
  return new Mistral({ apiKey });
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (!match) return undefined;
    try {
      return JSON.parse(match[0]);
    } catch {
      return undefined;
    }
  }
}

function normalizeLines(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((line) => (typeof line === "string" ? line.trim() : ""))
    .filter(Boolean)
    .slice(0, 4);
}

function normalizeSections(value: unknown): DashboardAiSummarySection[] {
  const source = Array.isArray(value)
    ? value
    : value && typeof value === "object" && Array.isArray((value as { sections?: unknown }).sections)
      ? (value as { sections: unknown[] }).sections
      : [];

  const byTitle = new Map<string, DashboardAiSummarySection>();
  for (const item of source) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const record = item as Record<string, unknown>;
    const title = typeof record.title === "string" ? record.title.trim() : "";
    const lines = normalizeLines(record.lines);
    if (title && lines.length) byTitle.set(title, { title, lines });
  }

  const ordered = sectionTitles.map((title) => byTitle.get(title) ?? { title, lines: [] });
  return ordered.map((section) => ({
    title: section.title,
    lines: section.lines.length ? section.lines : ["분석 결과를 생성했지만 이 섹션의 문장이 비어 있습니다."]
  }));
}

function contentToText(content: unknown) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((chunk) => {
      if (!chunk || typeof chunk !== "object") return "";
      const text = (chunk as { text?: unknown }).text;
      return typeof text === "string" ? text : "";
    })
    .join("");
}

function buildPrompt(payload: DashboardAiPayload) {
  return JSON.stringify(payload, null, 2);
}

export async function generateDashboardAiSummary(range: DashboardDateRange, options: GenerateOptions = {}): Promise<GenerateResult> {
  const { base, aiPayload, payloadHash } = await getDashboardAggregate(range);

  if (!options.force) {
    const cached = await prisma.dashboardAiSummary.findFirst({
      where: {
        period: range.period,
        startDate: range.startDate,
        endDate: range.endDate,
        payloadHash,
        status: "SUCCESS"
      },
      orderBy: { generatedAt: "desc" }
    });
    if (cached) {
      return {
        sections: normalizeSections(cached.sections),
        rawText: cached.rawText,
        generatedAt: cached.generatedAt.toISOString(),
        model: cached.model,
        payloadHash,
        sourceSnapshot: aiPayload,
        cached: true
      };
    }
  }

  const client = getMistralClient();
  const response = await client.chat.complete({
    model,
    temperature: 0.2,
    maxTokens: 1000,
    responseFormat: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "당신은 인천시약사회 ERP 운영 대시보드를 요약하는 사무국 분석가입니다. 제공된 집계 수치만 근거로 한국어 리포트를 작성하세요. 개인정보를 추정하거나 생성하지 말고, JSON 객체만 반환하세요. JSON 형식은 {\"sections\":[{\"title\":\"핵심 성과 요약\",\"lines\":[...]},{\"title\":\"특이사항 분석\",\"lines\":[...]},{\"title\":\"추천 액션 아이템\",\"lines\":[...]}]} 입니다. 각 섹션은 2~3개 문장으로 간결하게 작성하세요."
      },
      {
        role: "user",
        content: buildPrompt(aiPayload)
      }
    ]
  });

  const rawText = contentToText(response.choices[0]?.message?.content);
  const sections = normalizeSections(safeJsonParse(rawText));
  const saved = await prisma.dashboardAiSummary.create({
    data: {
      period: range.period,
      startDate: range.startDate,
      endDate: range.endDate,
      model,
      payloadHash,
      sections: sections as unknown as Prisma.InputJsonValue,
      rawText,
      sourceSnapshot: aiPayload as unknown as Prisma.InputJsonValue,
      status: "SUCCESS",
      generatedById: options.generatedById,
      generatedAt: new Date()
    }
  });

  return {
    sections,
    rawText,
    generatedAt: saved.generatedAt.toISOString(),
    model,
    payloadHash,
    sourceSnapshot: aiPayload,
    cached: false
  };
}
