import type { RouteObject } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AssetRegistrationPage } from "@/src/modules/AssetManagement/Asset Registration/list/asset-registration-page";
import { MODULES, ROUTES } from "@/src/constants/modules";

function AssetsRoutePage() {
  const navigate = useNavigate();

  return (
    <AssetRegistrationPage
      onRegister={() => navigate(ROUTES.ASSETS_CREATE)}
      onEdit={(assetId) => navigate(ROUTES.ASSETS_EDIT(assetId))}
    />
  );
}

export const assetsRoute: RouteObject = {
  path: MODULES.ASSETS,
  element: <AssetsRoutePage />,
};
