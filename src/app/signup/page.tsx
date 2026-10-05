"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";

type BranchOption = {
  id: string;
  title: string;
};

const roleLabels = {
  user: "일반 사용자",
  submaster: "분회/사무국 관리자",
  master: "최고 관리자"
};

export default function SignupPage() {
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/branches", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { items?: BranchOption[] }) => setBranches(payload.items ?? []))
      .catch(() => setBranches([]));
  }, []);

  async function submitSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          privacyConsent: formData.get("privacyConsent") === "on"
        })
      });
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) throw new Error(body.message ?? "회원가입 신청에 실패했습니다.");
      form.reset();
      setMessage(body.message ?? "회원가입 신청이 접수되었습니다.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "회원가입 신청에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="signup-panel" onSubmit={submitSignup}>
        <div className="auth-heading">
          <Image className="login-logo" src="/incheon_pharmacy_logo.JPG" alt="인천시약사회 로고" width={64} height={64} priority />
          <div>
            <p className="eyebrow">인천시약사회 Admin Center</p>
            <h1>회원가입 신청</h1>
            <p>관리자 승인 후 ERP를 이용할 수 있습니다.</p>
          </div>
        </div>

        <div className="signup-grid">
          <label>
            <span>이름</span>
            <input name="name" required />
          </label>
          <label>
            <span>전화번호</span>
            <input name="phone" placeholder="010-0000-0000" required />
          </label>
          <label>
            <span>ID</span>
            <input name="loginId" placeholder="ID를 입력하세요" minLength={4} maxLength={30} pattern="[A-Za-z0-9_-]{4,30}" autoComplete="username" required />
          </label>
          <label>
            <span>이메일</span>
            <input name="email" type="email" placeholder="선택 입력" />
          </label>
          <label>
            <span>비밀번호</span>
            <input name="password" type="password" minLength={8} autoComplete="new-password" required />
          </label>
          <label>
            <span>비밀번호 확인</span>
            <input name="passwordConfirm" type="password" minLength={8} autoComplete="new-password" required />
          </label>
          <label>
            <span>소속분회</span>
            <select name="branchId" required defaultValue="">
              <option value="" disabled>
                선택하세요
              </option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>요청 권한</span>
            <select name="requestedRole" required defaultValue="user">
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>직책</span>
            <input name="positionTitle" placeholder="예: 사무국장, 직원, 분회장" />
          </label>
          <label>
            <span>소속 기관/부서</span>
            <input name="organizationName" placeholder="예: 인천시약사회 사무국" />
          </label>
          <label className="full-width">
            <span>가입 신청 사유</span>
            <textarea name="requestReason" rows={4} />
          </label>
          <label className="checkbox-line full-width">
            <input name="privacyConsent" type="checkbox" required />
            <span>계정 생성을 위한 개인정보 수집 및 처리에 동의합니다.</span>
          </label>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {message ? <p className="form-success">{message}</p> : null}

        <div className="form-actions">
          <Link className="secondary-button" href="/login">
            <ArrowLeft size={16} />
            로그인으로 돌아가기
          </Link>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            <Send size={16} />
            {isSubmitting ? "신청 중" : "가입 신청"}
          </button>
        </div>
      </form>
    </main>
  );
}
