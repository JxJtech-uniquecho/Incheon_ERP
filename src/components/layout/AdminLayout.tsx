import type { ReactNode } from "react";
import { AutoLogoutProvider } from "@/components/auth/AutoLogoutProvider";
import { IconRail } from "@/components/layout/IconRail";
import { ModuleSidebar } from "@/components/layout/ModuleSidebar";

type AdminLayoutProps = {
  children: ReactNode;
  activeModule: string;
  activeMenu: string;
};

export function AdminLayout({ children, activeModule, activeMenu }: AdminLayoutProps) {
  return (
    <AutoLogoutProvider>
      <div className="admin-shell">
        <IconRail activeModule={activeModule} />
        <ModuleSidebar activeMenu={activeMenu} />
        <main className="main-content">{children}</main>
      </div>
    </AutoLogoutProvider>
  );
}
