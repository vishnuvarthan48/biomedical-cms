import type { RouteObject } from "react-router-dom"
import { ReportsPage } from "@/components/cmms/reports-page"
import { MODULES } from "@/constants/modules"

export const reportsRoute: RouteObject = {
  path: MODULES.REPORTS,
  element: <ReportsPage />,
}
