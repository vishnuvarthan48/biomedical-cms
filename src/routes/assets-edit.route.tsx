import type { RouteObject } from "react-router-dom"
import { useNavigate, useParams } from "react-router-dom"
import { AssetRegistrationForm } from "@/components/cmms/asset-registration-form"
import { MODULES, ROUTES } from "@/constants/modules"

function AssetsEditRoutePage() {
  const navigate = useNavigate()
  const { id } = useParams()

  return <AssetRegistrationForm onBack={() => navigate(ROUTES.ASSETS)} editAssetId={id ?? null} />
}

export const assetsEditRoute: RouteObject = {
  path: `${MODULES.ASSETS}/edit/:id`,
  element: <AssetsEditRoutePage />,
}
