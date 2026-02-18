import type { RouteObject } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { DashboardPage } from "@/src/modules/Overview/Dashboard/dashboard-page";
import { MODULES } from "@/src/constants/modules";

function DashboardRoutePage() {
  const navigate = useNavigate();

  return <DashboardPage onNavigate={(path) => navigate(path)} />;
}

export const dashboardRoute: RouteObject = {
  path: MODULES.DASHBOARD,
  element: <DashboardRoutePage />,
};
