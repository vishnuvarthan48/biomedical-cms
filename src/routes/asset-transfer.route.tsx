import type { RouteObject } from "react-router-dom"
import { AssetTransferPage } from "@/components/cmms/asset-transfer-page"
import { MODULES } from "@/constants/modules"

export const assetTransferRoute: RouteObject = {
  path: MODULES.ASSET_TRANSFER,
  element: <AssetTransferPage />,
}
