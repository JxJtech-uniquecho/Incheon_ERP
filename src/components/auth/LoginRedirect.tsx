"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LOGIN_RETURN_TO_COOKIE, sanitizeLoginReturnTo } from "@/lib/login-return";

function setLoginReturnCookie(value: string) {
  document.cookie = `${LOGIN_RETURN_TO_COOKIE}=${encodeURIComponent(value)}; Max-Age=600; Path=/login; SameSite=Lax`;
}

type LoginRedirectProps = {
  returnTo: string;
  reason?: string;
};

export function LoginRedirect({ returnTo, reason }: LoginRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const safeReturnTo = sanitizeLoginReturnTo(returnTo);
    setLoginReturnCookie(safeReturnTo);
    router.replace(reason ? `/login?reason=${encodeURIComponent(reason)}` : "/login");
    router.refresh();
  }, [reason, returnTo, router]);

  return null;
}

