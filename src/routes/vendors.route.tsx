import type { RouteObject } from "react-router-dom";
import { VendorRegistrationPage } from "@/src/modules/Operations/VendorRegistration/vendor-registration-page";
import { MODULES } from "@/src/constants/modules";

export const vendorsRoute: RouteObject = {
  path: MODULES.VENDORS,
  element: <VendorRegistrationPage />,
};
