import type { RouteObject } from "react-router-dom";
import { TicketRegistrationPage } from "@/src/modules/Maintenance/TicketRegistration/ticket-registration-page";
import { MODULES } from "@/src/constants/modules";

export const ticketRegistrationRoute: RouteObject = {
  path: MODULES.TICKET_REGISTRATION,
  element: <TicketRegistrationPage />,
};
