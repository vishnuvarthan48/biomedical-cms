import type { RouteObject } from "react-router-dom";
import { LocationMasterPage } from "@/src/modules/Administration/LocationMaster/location-master-page";
import { MODULES } from "@/src/constants/modules";

export const locationsRoute: RouteObject = {
  path: MODULES.LOCATIONS,
  element: <LocationMasterPage />,
};
