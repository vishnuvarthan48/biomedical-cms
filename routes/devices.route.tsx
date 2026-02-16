import type { RouteObject } from "react-router-dom"
import { DeviceManagementPage } from "@/components/cmms/device-management-page"
import { MODULES } from "@/constants/modules"

export const devicesRoute: RouteObject = {
  path: MODULES.DEVICES,
  element: <DeviceManagementPage />,
}
