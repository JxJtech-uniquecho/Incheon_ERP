"use client";

import { CrudWorkspace } from "@/components/erp/CrudWorkspace";
import { erpPageConfigs } from "@/lib/mock/erp-pages";

export default function TicketsPage() {
  return <CrudWorkspace config={erpPageConfigs.tickets} />;
}
