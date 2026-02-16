import type { RouteObject } from "react-router-dom"
import { WorkOrdersPage } from "@/components/cmms/work-orders-page"
import { MODULES } from "@/constants/modules"

export const workOrdersRoute: RouteObject = {
  path: MODULES.WORK_ORDERS,
  element: <WorkOrdersPage />,
}
