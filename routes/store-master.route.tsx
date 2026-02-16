import type { RouteObject } from "react-router-dom"
import { StoreMasterPage } from "@/components/cmms/store-master-page"
import { MODULES } from "@/constants/modules"

export const storeMasterRoute: RouteObject = {
  path: MODULES.STORE_MASTER,
  element: <StoreMasterPage />,
}
