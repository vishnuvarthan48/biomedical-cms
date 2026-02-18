import type { RouteObject } from "react-router-dom";
import { ReportsPage } from "@/src/modules/Analytics/Reports/reports-page";
import { MODULES } from "@/src/constants/modules";

export const reportsRoute: RouteObject = {
  path: MODULES.REPORTS,
  element: <ReportsPage />,
};
