import type { RouteObject } from "react-router-dom";
import { CalibrationPage } from "@/src/modules/Maintenance/Calibration/list/calibration-page";
import { MODULES } from "@/src/constants/modules";

export const calibrationRoute: RouteObject = {
  path: MODULES.CALIBRATION,
  element: <CalibrationPage />,
};
