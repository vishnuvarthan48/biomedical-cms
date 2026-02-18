import type { RouteObject } from "react-router-dom";
import { PreventiveMaintenancePage } from "@/src/modules/Maintenance/PreventiveMaintenance/list/preventive-maintenance-page";
import { MODULES } from "@/src/constants/modules";

export const pmRoute: RouteObject = {
  path: MODULES.PM,
  element: <PreventiveMaintenancePage />,
};
