import type { RouteObject } from "react-router-dom"
import { CalibrationPage } from "@/components/cmms/calibration-page"
import { MODULES } from "@/constants/modules"

export const calibrationRoute: RouteObject = {
  path: MODULES.CALIBRATION,
  element: <CalibrationPage />,
}
