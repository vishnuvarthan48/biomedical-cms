import type { RouteObject } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import { AssetRegistrationForm } from "@/src/modules/AssetManagement/Asset Registration/form/asset-registration-form";
import { MODULES, ROUTES } from "@/src/constants/modules";

function AssetsEditRoutePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <AssetRegistrationForm
      onBack={() => navigate(ROUTES.ASSETS)}
      editAssetId={id ?? null}
    />
  );
}

export const assetsEditRoute: RouteObject = {
  path: `${MODULES.ASSETS}/edit/:id`,
  element: <AssetsEditRoutePage />,
};
