import type { RouteObject } from "react-router-dom";
import { PlatformAdminPage } from "@/src/modules/Platform/TenantManagement/list/platform-admin-page";
import { MODULES } from "@/src/constants/modules";

export const platformAdminRoute: RouteObject = {
  path: MODULES.PLATFORM_ADMIN,
  element: <PlatformAdminPage />,
};
