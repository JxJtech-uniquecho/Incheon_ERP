"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { ClipboardCheck, FileText, Home, LogOut, Settings, Ticket, Users, WalletCards, CalendarDays } from "lucide-react";

const railItems = [
  { key: "dashboard", label: "홈", href: "/dashboard", icon: Home },
  { key: "members", label: "회원", href: "/members", icon: Users },
  { key: "dues", label: "회비", href: "/dues", icon: WalletCards },
  { key: "documents", label: "문서", href: "/documents", icon: FileText },
  { key: "events", label: "회의", href: "/events", icon: CalendarDays },
  { key: "tickets", label: "민원", href: "/tickets", icon: Ticket },
  { key: "approvals", label: "결재", href: "/approvals", icon: ClipboardCheck },
  { key: "settings", label: "설정", href: "/settings", icon: Settings }
];

type IconRailProps = {
  activeModule: string;
};

export function IconRail({ activeModule }: IconRailProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/login", redirect: false });
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="icon-rail" aria-label="주요 모듈">
      <nav className="rail-nav">
        {railItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              className={`rail-link ${activeModule === item.key ? "active" : ""}`}
              href={item.href}
              title={item.label}
              aria-label={item.label}
            >
              <Icon size={22} strokeWidth={2.1} />
            </Link>
          );
        })}
      </nav>
      <button className="rail-user" type="button" title="로그아웃" aria-label="로그아웃" onClick={() => void handleSignOut()} disabled={isSigningOut}>
        <LogOut size={21} />
      </button>
    </aside>
  );
}
