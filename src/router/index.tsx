import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/src/components/cmms/app-shell";
import { ROUTES } from "@/src/constants/modules";
import { useAuth } from "@/src/context/auth-context";
import { dashboardRoute } from "../routes/dashboard.route";
import { assetsRoute } from "../routes/assets.route";
import { assetsCreateRoute } from "../routes/assets-create.route";
import { assetsEditRoute } from "../routes/assets-edit.route";
import { devicesRoute } from "../routes/devices.route";
import { assetTransferRoute } from "../routes/asset-transfer.route";
import { workOrdersRoute } from "../routes/work-orders.route";
import { pmRoute } from "../routes/pm.route";
import { calibrationRoute } from "../routes/calibration.route";
import { storeMasterRoute } from "../routes/store-master.route";
import { itemMasterRoute } from "../routes/item-master.route";
import { grnRoute } from "../routes/grn.route";
import { vendorsRoute } from "../routes/vendors.route";
import { reportsRoute } from "../routes/reports.route";
import { complianceRoute } from "../routes/compliance.route";
import { tenantAdminRoute } from "../routes/tenant-admin.route";
import { platformAdminRoute } from "../routes/platform-admin.route";
import { ticketRegistrationRoute } from "../routes/ticket-registration.route";
import { ticketMobileRoute } from "../routes/ticket-mobile.route";
import { voucherSeriesRoute } from "../routes/voucher-series.route";
import { locationsRoute } from "../routes/locations.route";
import { notificationSettingsRoute } from "../routes/notification-settings.route";

function RoleAwareRedirect() {
  const { userRole } = useAuth();
  if (userRole === "cmms-enduser") {
    return <Navigate to={ROUTES.TICKET_REGISTRATION} replace />;
  }
  return <Navigate to={ROUTES.DASHBOARD} replace />;
}

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <AppShell />,
    children: [
      { index: true, element: <RoleAwareRedirect /> },
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
      ticketRegistrationRoute,
      ticketMobileRoute,
      voucherSeriesRoute,
      locationsRoute,
      notificationSettingsRoute,
      { path: "*", element: <Navigate to={ROUTES.DASHBOARD} replace /> },
    ],
  },
]);
