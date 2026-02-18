import type { RouteObject } from "react-router-dom";
import { ItemMasterPage } from "@/src/modules/Operations/ItemMaster/item-master-page";
import { MODULES } from "@/src/constants/modules";

export const itemMasterRoute: RouteObject = {
  path: MODULES.ITEM_MASTER,
  element: <ItemMasterPage />,
};
