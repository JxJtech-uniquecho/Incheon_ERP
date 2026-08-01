"use client";

import { CrudWorkspace } from "@/components/erp/CrudWorkspace";
import { erpPageConfigs } from "@/lib/mock/erp-pages";

export default function SettingsPage() {
  return <CrudWorkspace config={erpPageConfigs.settings} />;
}
