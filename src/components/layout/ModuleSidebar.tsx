import Image from "next/image";
import Link from "next/link";
import { Building2, CalendarDays, ClipboardCheck, ClipboardList, FileText, Home, Landmark, Settings, Users } from "lucide-react";

const sections = [
  {
    title: "대시보드",
    items: [
      { label: "홈", href: "/dashboard", key: "home", icon: Home },
      { label: "오늘의 업무", href: "/dashboard?view=today", key: "today", icon: ClipboardList },
      { label: "미처리 업무", href: "/tickets?status=open", key: "open-tickets", icon: ClipboardList }
    ]
  },
  {
    title: "회원",
    items: [
      { label: "회원 관리", href: "/members", key: "members", icon: Users },
      { label: "약국 관리", href: "/pharmacies", key: "pharmacies", icon: Building2 },
      { label: "분회 관리", href: "/members/branches", key: "branches", icon: Landmark },
      { label: "임원·위원회 관리", href: "/members/committees", key: "committees", icon: Users }
    ]
  },
  {
    title: "회비",
    items: [
      { label: "회비 현황", href: "/dues", key: "dues", icon: Landmark },
      { label: "입금 관리", href: "/dues/payments", key: "payments", icon: Landmark },
      { label: "미납자 관리", href: "/dues/unpaid", key: "unpaid", icon: Users }
    ]
  },
  {
    title: "문서",
    items: [
      { label: "공문 관리", href: "/documents", key: "documents", icon: FileText },
      { label: "회의자료", href: "/documents/meetings", key: "meeting-docs", icon: FileText },
      { label: "보도자료", href: "/documents/press", key: "press", icon: FileText }
    ]
  },
  {
    title: "업무",
    items: [
      { label: "민원·업무요청", href: "/tickets", key: "tickets", icon: ClipboardList },
      { label: "결재함", href: "/approvals", key: "approvals", icon: ClipboardCheck },
      { label: "회의·행사", href: "/events", key: "events", icon: CalendarDays }
    ]
  },
  {
    title: "시스템",
    items: [
      { label: "설정", href: "/settings", key: "settings", icon: Settings },
      { label: "사용자 승인", href: "/settings/users", key: "users", icon: Users }
    ]
  }
];

type ModuleSidebarProps = {
  activeMenu: string;
};

export function ModuleSidebar({ activeMenu }: ModuleSidebarProps) {
  return (
    <aside className="module-sidebar" aria-label="모듈 메뉴">
      <div className="sidebar-brand">
        <Image className="sidebar-logo" src="/incheon_pharmacy_logo.JPG" alt="인천시약사회 로고" width={48} height={48} priority />
        <div>
          <p className="sidebar-brand-name">인천시약사회</p>
          <p className="sidebar-brand-subtitle">Admin Center</p>
        </div>
      </div>
      {sections.map((section) => (
        <section className="sidebar-section" key={section.title}>
          <h2 className="sidebar-section-title">{section.title}</h2>
          <ul className="sidebar-menu">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.key}>
                  <Link className={activeMenu === item.key ? "active" : ""} href={item.href}>
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </aside>
  );
}
