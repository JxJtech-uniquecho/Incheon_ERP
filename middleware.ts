import { NextRequest, NextResponse } from "next/server";
import { LOGIN_RETURN_TO_COOKIE, LOGIN_RETURN_TO_COOKIE_MAX_AGE, sanitizeLoginReturnTo } from "@/lib/login-return";

const publicPaths = ["/login", "/signup"];

function hasSessionCookie(request: NextRequest) {
  return Boolean(request.cookies.get("next-auth.session-token") || request.cookies.get("__Secure-next-auth.session-token"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api")) return NextResponse.next();

  const isPublic =
    publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/incheon_pharmacy_logo.JPG";

  if (isPublic) return NextResponse.next();

  if (!hasSessionCookie(request)) {
    const url = new URL("/login", request.url);
    const response = NextResponse.redirect(url);
    response.cookies.set(LOGIN_RETURN_TO_COOKIE, sanitizeLoginReturnTo(`${request.nextUrl.pathname}${request.nextUrl.search}`), {
      maxAge: LOGIN_RETURN_TO_COOKIE_MAX_AGE,
      sameSite: "lax",
      path: "/login",
      secure: process.env.NODE_ENV === "production"
    });
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-current-path", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"]
};
