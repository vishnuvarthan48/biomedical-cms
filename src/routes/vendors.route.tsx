import type { RouteObject } from "react-router-dom"
import { VendorRegistrationPage } from "@/components/cmms/vendor-registration-page"
import { MODULES } from "@/constants/modules"

export const vendorsRoute: RouteObject = {
  path: MODULES.VENDORS,
  element: <VendorRegistrationPage />,
}
