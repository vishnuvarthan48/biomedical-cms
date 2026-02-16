import type { RouteObject } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { AssetRegistrationPage } from "@/components/cmms/asset-registration-page"
import { MODULES, ROUTES } from "@/constants/modules"

function AssetsRoutePage() {
  const navigate = useNavigate()

  return (
    <AssetRegistrationPage
      onRegister={() => navigate(ROUTES.ASSETS_CREATE)}
      onEdit={(assetId) => navigate(ROUTES.ASSETS_EDIT(assetId))}
    />
  )
}

export const assetsRoute: RouteObject = {
  path: MODULES.ASSETS,
  element: <AssetsRoutePage />,
}
