import type { RouteObject } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AssetRegistrationForm } from "@/src/modules/AssetManagement/Asset Registration/form/asset-registration-form";
import { MODULES, ROUTES } from "@/src/constants/modules";

function AssetsCreateRoutePage() {
  const navigate = useNavigate();

  return (
    <AssetRegistrationForm
      onBack={() => navigate(ROUTES.ASSETS)}
      editAssetId={null}
    />
  );
}

export const assetsCreateRoute: RouteObject = {
  path: `${MODULES.ASSETS}/create`,
  element: <AssetsCreateRoutePage />,
};
