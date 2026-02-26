import type { RouteObject } from "react-router-dom";
import { TicketAllocationRulesPage } from "@/src/modules/Administration/TicketAllocationRules/ticket-allocation-rules-page";
import { MODULES } from "@/src/constants/modules";

export const ticketAllocationRulesRoute: RouteObject = {
  path: MODULES.TICKET_ALLOCATION_RULES,
  element: <TicketAllocationRulesPage />,
};
