import type { RouteObject } from "react-router-dom";
import { CompliancePage } from "@/src/modules/Analytics/Compliance/compliance-page";
import { MODULES } from "@/src/constants/modules";

export const complianceRoute: RouteObject = {
  path: MODULES.COMPLIANCE,
  element: <CompliancePage />,
};
