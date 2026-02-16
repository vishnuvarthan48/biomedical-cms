import type { RouteObject } from "react-router-dom"
import { PreventiveMaintenancePage } from "@/components/cmms/preventive-maintenance-page"
import { MODULES } from "@/constants/modules"

export const pmRoute: RouteObject = {
  path: MODULES.PM,
  element: <PreventiveMaintenancePage />,
}
