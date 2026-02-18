import type { RouteObject } from "react-router-dom";
import { StoreMasterPage } from "@/src/modules/Operations/BiomedicalStoreMaster/store-master-page";
import { MODULES } from "@/src/constants/modules";

export const storeMasterRoute: RouteObject = {
  path: MODULES.STORE_MASTER,
  element: <StoreMasterPage />,
};
