import type { RouteObject } from "react-router-dom";
import { WorkOrdersPage } from "@/src/modules/Maintenance/WorkOrders/list/work-orders-page";
import { MODULES } from "@/src/constants/modules";

export const workOrdersRoute: RouteObject = {
  path: MODULES.WORK_ORDERS,
  element: <WorkOrdersPage />,
};
