import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookieName, getSessionCookieOptions, LoginFailure, SESSION_MAX_AGE_SECONDS, validateLogin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

function loginUrl(request: NextRequest, error?: string) {
  const url = new URL("/login", request.url);
  if (error) url.searchParams.set("error", error);
  return url.toString();
}

function safeCallbackUrl(request: NextRequest, value: FormDataEntryValue | null) {
  const fallback = new URL("/dashboard", request.url).toString();
  const callbackUrl = String(value ?? "");
  if (!callbackUrl) return fallback;

  try {
    const parsed = new URL(callbackUrl, request.url);
    if (parsed.origin !== new URL(request.url).origin) return fallback;
    return parsed.toString();
  } catch {
    return fallback;
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const callbackUrl = safeCallbackUrl(request, formData.get("callbackUrl"));

  try {
    const user = await validateLogin(formData.get("loginId"), formData.get("password"));
    const sessionToken = randomUUID();
    const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires
      }
    });

    const response = NextResponse.json({ url: callbackUrl });
    response.cookies.set(getSessionCookieName(), sessionToken, {
      ...getSessionCookieOptions(),
      expires
    });
    return response;
  } catch (error) {
    const failure = error instanceof LoginFailure ? error.reason : "invalid";
    return NextResponse.json({ url: loginUrl(request, failure) }, { status: 401 });
  }
}
