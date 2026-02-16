import type { RouteObject } from "react-router-dom"
import { PlatformAdminPage } from "@/components/cmms/platform-admin-page"
import { MODULES } from "@/constants/modules"

export const platformAdminRoute: RouteObject = {
  path: MODULES.PLATFORM_ADMIN,
  element: <PlatformAdminPage />,
}
