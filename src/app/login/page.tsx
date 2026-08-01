import { cookies } from "next/headers";
import { LoginForm } from "./LoginForm";
import { LOGIN_RETURN_TO_COOKIE, sanitizeLoginReturnTo } from "@/lib/login-return";

type LoginPageProps = {
  searchParams?: {
    callbackUrl?: string | string[];
    reason?: string | string[];
  };
};

function firstSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const cookieStore = await cookies();
  const callbackUrlQuery = firstSearchParam(searchParams?.callbackUrl);
  const reason = firstSearchParam(searchParams?.reason);
  const callbackUrlCookie = cookieStore.get(LOGIN_RETURN_TO_COOKIE)?.value ?? "";
  const initialCallbackUrl = sanitizeLoginReturnTo(callbackUrlQuery || callbackUrlCookie);

  return <LoginForm initialCallbackUrl={initialCallbackUrl} reason={reason} />;
}
