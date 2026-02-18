import type { RouteObject } from "react-router-dom";
import { AssetTransferPage } from "@/src/modules/AssetManagement/Asset Transfer/list/asset-transfer-page";
import { MODULES } from "@/src/constants/modules";

export const assetTransferRoute: RouteObject = {
  path: MODULES.ASSET_TRANSFER,
  element: <AssetTransferPage />,
};
