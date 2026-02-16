import type { RouteObject } from "react-router-dom"
import { GrnPage } from "@/components/cmms/grn-page"
import { MODULES } from "@/constants/modules"

export const grnRoute: RouteObject = {
  path: MODULES.GRN,
  element: <GrnPage />,
}
