import type { RouteObject } from "react-router-dom"
import { TenantAdminPage } from "@/components/cmms/tenant-admin-page"
import { MODULES } from "@/constants/modules"

export const tenantAdminRoute: RouteObject = {
  path: MODULES.TENANT_ADMIN,
  element: <TenantAdminPage />,
}
