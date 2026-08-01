"use client";

import { CrudWorkspace } from "@/components/erp/CrudWorkspace";
import { erpPageConfigs } from "@/lib/mock/erp-pages";

export default function DocumentsPage() {
  return <CrudWorkspace config={erpPageConfigs.documents} />;
}
