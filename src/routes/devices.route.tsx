import type { RouteObject } from "react-router-dom";
import { DeviceManagementPage } from "@/src/modules/AssetManagement/DeviceManagement/list/device-management-page";
import { MODULES } from "@/src/constants/modules";

export const devicesRoute: RouteObject = {
  path: MODULES.DEVICES,
  element: <DeviceManagementPage />,
};
