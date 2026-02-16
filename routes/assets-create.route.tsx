import type { RouteObject } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { AssetRegistrationForm } from "@/components/cmms/asset-registration-form"
import { MODULES, ROUTES } from "@/constants/modules"

function AssetsCreateRoutePage() {
  const navigate = useNavigate()

  return <AssetRegistrationForm onBack={() => navigate(ROUTES.ASSETS)} editAssetId={null} />
}

export const assetsCreateRoute: RouteObject = {
  path: `${MODULES.ASSETS}/create`,
  element: <AssetsCreateRoutePage />,
}
