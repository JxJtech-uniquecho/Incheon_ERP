import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  return NextResponse.json({
    credentials: {
      id: "credentials",
      name: "ERP Credentials",
      type: "credentials",
      signinUrl: `${origin}/api/auth/signin/credentials`,
      callbackUrl: `${origin}/api/auth/callback/credentials`
    }
  });
}
