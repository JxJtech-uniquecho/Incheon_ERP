"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";

const WARNING_AFTER_MS = 29 * 60 * 1000;
const LOGOUT_AFTER_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "keydown", "scroll", "touchstart", "click"];

export function AutoLogoutProvider({ children }: { children: ReactNode }) {
  const [showWarning, setShowWarning] = useState(false);
  const warningTimer = useRef<number | null>(null);
  const logoutTimer = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (warningTimer.current !== null) window.clearTimeout(warningTimer.current);
    if (logoutTimer.current !== null) window.clearTimeout(logoutTimer.current);
    warningTimer.current = null;
    logoutTimer.current = null;
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();
    warningTimer.current = window.setTimeout(() => setShowWarning(true), WARNING_AFTER_MS);
    logoutTimer.current = window.setTimeout(() => {
      void signOut({ callbackUrl: "/login?reason=timeout" });
    }, LOGOUT_AFTER_MS);
  }, [clearTimers]);

  const resetTimers = useCallback(() => {
    setShowWarning(false);
    startTimers();
  }, [startTimers]);

  useEffect(() => {
    startTimers();
    const onActivity = () => {
      if (!showWarning) resetTimers();
    };
    ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, onActivity, { passive: true }));
    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, onActivity));
    };
  }, [clearTimers, resetTimers, showWarning, startTimers]);

  async function continueSession() {
    const response = await fetch("/api/auth/me", { cache: "no-store" });
    if (!response.ok) {
      await signOut({ callbackUrl: "/login" });
      return;
    }
    resetTimers();
  }

  return (
    <>
      {children}
      {showWarning ? (
        <div className="modal-backdrop" role="presentation">
          <div className="timeout-modal" role="dialog" aria-modal="true" aria-labelledby="timeout-title">
            <h2 id="timeout-title">자동 로그아웃 예정</h2>
            <p>1분 동안 활동이 없으면 보안을 위해 로그아웃됩니다.</p>
            <div className="form-actions">
              <button className="secondary-button" type="button" onClick={() => void signOut({ callbackUrl: "/login" })}>
                로그아웃
              </button>
              <button className="primary-button" type="button" onClick={() => void continueSession()}>
                계속 사용
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
