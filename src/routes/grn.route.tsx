import type { RouteObject } from "react-router-dom";
import { GrnPage } from "@/src/modules/Operations/GoodsReceiptNoteGRN/grn-page";
import { MODULES } from "@/src/constants/modules";

export const grnRoute: RouteObject = {
  path: MODULES.GRN,
  element: <GrnPage />,
};
