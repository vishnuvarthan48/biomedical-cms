import type { RouteObject } from "react-router-dom";
import { NotificationSettingsPage } from "@/src/modules/Administration/NotificationSettings/notification-settings-page";
import { MODULES } from "@/src/constants/modules";

export const notificationSettingsRoute: RouteObject = {
  path: MODULES.NOTIFICATION_SETTINGS,
  element: <NotificationSettingsPage />,
};
