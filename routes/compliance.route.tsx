import type { RouteObject } from "react-router-dom"
import { CompliancePage } from "@/components/cmms/compliance-page"
import { MODULES } from "@/constants/modules"

export const complianceRoute: RouteObject = {
  path: MODULES.COMPLIANCE,
  element: <CompliancePage />,
}
