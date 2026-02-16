import type { RouteObject } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { DashboardPage } from "@/components/cmms/dashboard-page"
import { MODULES } from "@/constants/modules"

function DashboardRoutePage() {
  const navigate = useNavigate()

  return <DashboardPage onNavigate={(path) => navigate(path)} />
}

export const dashboardRoute: RouteObject = {
  path: MODULES.DASHBOARD,
  element: <DashboardRoutePage />,
}
