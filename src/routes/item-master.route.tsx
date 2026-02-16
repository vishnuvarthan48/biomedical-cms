import type { RouteObject } from "react-router-dom"
import { ItemMasterPage } from "@/components/cmms/item-master-page"
import { MODULES } from "@/constants/modules"

export const itemMasterRoute: RouteObject = {
  path: MODULES.ITEM_MASTER,
  element: <ItemMasterPage />,
}
