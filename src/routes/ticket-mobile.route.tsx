import type { RouteObject } from "react-router-dom";
import { TicketMobilePage } from "@/src/modules/Maintenance/TicketMobile/ticket-mobile-page";
import { MODULES } from "@/src/constants/modules";

export const ticketMobileRoute: RouteObject = {
  path: MODULES.TICKET_MOBILE,
  element: <TicketMobilePage />,
};
