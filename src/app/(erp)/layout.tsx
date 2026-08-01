import type { ReactNode } from "react";
import { headers } from "next/headers";
import { getApprovedSessionUser } from "@/lib/server/authz";
import { LoginRedirect } from "@/components/auth/LoginRedirect";

export default async function ErpLayout({ children }: { children: ReactNode }) {
  const auth = await getApprovedSessionUser();

  if (auth.status !== "ok") {
    const headerList = await headers();
    const currentPath = headerList.get("x-current-path") ?? "/dashboard";
    return <LoginRedirect returnTo={currentPath} reason={auth.status === "forbidden" ? "forbidden" : undefined} />;
  }

  return children;
}
