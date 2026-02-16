import { Navigate, createBrowserRouter } from "react-router-dom"
import { AppShell } from "@/components/cmms/app-shell"
import { ROUTES } from "@/constants/modules"
import { dashboardRoute } from "@/routes/dashboard.route"
import { assetsRoute } from "@/routes/assets.route"
import { assetsCreateRoute } from "@/routes/assets-create.route"
import { assetsEditRoute } from "@/routes/assets-edit.route"
import { devicesRoute } from "@/routes/devices.route"
import { assetTransferRoute } from "@/routes/asset-transfer.route"
import { workOrdersRoute } from "@/routes/work-orders.route"
import { pmRoute } from "@/routes/pm.route"
import { calibrationRoute } from "@/routes/calibration.route"
import { storeMasterRoute } from "@/routes/store-master.route"
import { itemMasterRoute } from "@/routes/item-master.route"
import { grnRoute } from "@/routes/grn.route"
import { vendorsRoute } from "@/routes/vendors.route"
import { reportsRoute } from "@/routes/reports.route"
import { complianceRoute } from "@/routes/compliance.route"
import { tenantAdminRoute } from "@/routes/tenant-admin.route"
import { platformAdminRoute } from "@/routes/platform-admin.route"

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
      dashboardRoute,
      assetsRoute,
      assetsCreateRoute,
      assetsEditRoute,
      devicesRoute,
      assetTransferRoute,
      workOrdersRoute,
      pmRoute,
      calibrationRoute,
      storeMasterRoute,
      itemMasterRoute,
      grnRoute,
      vendorsRoute,
      reportsRoute,
      complianceRoute,
      tenantAdminRoute,
      platformAdminRoute,
      { path: "*", element: <Navigate to={ROUTES.DASHBOARD} replace /> },
    ],
  },
])
