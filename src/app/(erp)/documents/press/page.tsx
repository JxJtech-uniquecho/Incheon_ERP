"use client";

import { CrudWorkspace } from "@/components/erp/CrudWorkspace";
import { erpPageConfigs } from "@/lib/mock/erp-pages";

export default function PressPage() {
  return <CrudWorkspace config={erpPageConfigs.press} />;
}
