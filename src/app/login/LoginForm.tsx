"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { signIn } from "next-auth/react";
import { LOGIN_RETURN_TO_COOKIE } from "@/lib/login-return";

function clearLoginReturnToCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${LOGIN_RETURN_TO_COOKIE}=; Max-Age=0; Path=/login; SameSite=Lax`;
}

function getCleanLoginUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("callbackUrl")) return "";
  url.searchParams.delete("callbackUrl");
  const nextSearch = url.searchParams.toString();
  return `${url.pathname}${nextSearch ? `?${nextSearch}` : ""}`;
}

type LoginFormProps = {
  initialCallbackUrl: string;
  reason?: string;
};

export function LoginForm({ initialCallbackUrl, reason }: LoginFormProps) {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    clearLoginReturnToCookie();

    const cleanLoginUrl = getCleanLoginUrl();
    if (cleanLoginUrl) {
      router.replace(cleanLoginUrl);
    }
  }, [router]);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const result = await signIn("credentials", {
      loginId,
      password,
      callbackUrl: initialCallbackUrl,
      redirect: false
    });

    if (result?.ok) {
      clearLoginReturnToCookie();
      router.push(initialCallbackUrl);
      router.refresh();
      return;
    }

    setError(result?.error === "pending" ? "관리자 승인 대기 중인 계정입니다. 승인 후 이용할 수 있습니다." : "ID 또는 비밀번호가 올바르지 않습니다.");
  }

  return (
    <main className="login-page">
      <form className="login-panel" onSubmit={submitLogin}>
        <Image className="login-logo" src="/incheon_pharmacy_logo.JPG" alt="인천시약사회 로고" width={76} height={76} priority />
        <p className="eyebrow">ERP v1</p>
        <h1>인천시약사회 Admin Center</h1>
        {reason === "timeout" ? <p>세션이 만료되어 다시 로그인해야 합니다.</p> : <p>사무국 업무지원 ERP</p>}
        <label>
          <span>ID</span>
          <input
            type="text"
            value={loginId}
            onChange={(event) => setLoginId(event.target.value)}
            autoComplete="username"
            placeholder="ID를 입력하세요"
            minLength={4}
            maxLength={30}
            required
          />
        </label>
        <label>
          <span>비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="비밀번호를 입력하세요"
            required
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        {notice ? <p className="form-success">{notice}</p> : null}
        <button className="primary-button login-button" type="submit">
          <LogIn size={17} />
          로그인
        </button>
        <div className="auth-links">
          <Link href="/signup">
            <UserPlus size={15} />
            회원가입
          </Link>
          <button type="button" onClick={() => setNotice("비밀번호 찾기는 준비중입니다.")}>
            비밀번호 찾기
          </button>
        </div>
      </form>
    </main>
  );
}
