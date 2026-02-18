import type { RouteObject } from "react-router-dom";
import { TenantAdminPage } from "@/src/modules/Administration/TenantAdministration/list/tenant-admin-page";
import { MODULES } from "@/src/constants/modules";

export const tenantAdminRoute: RouteObject = {
  path: MODULES.TENANT_ADMIN,
  element: <TenantAdminPage />,
};
