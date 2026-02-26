import { RouteObject } from "react-router-dom";
import ContractManagementPage from "@/src/modules/Contracts/ContractManagement/contract-management-page";
import ContractCreatePage from "@/src/modules/Contracts/ContractManagement/contract-create-page";

export const contractManagementRoute: RouteObject = {
  path: "contract-management",
  children: [
    {
      index: true,
      element: <ContractManagementPage />,
    },
    {
      path: "create",
      element: <ContractCreatePage />,
    },
  ],
};
