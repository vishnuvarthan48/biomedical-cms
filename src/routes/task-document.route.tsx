import { RouteObject } from "react-router-dom";
import { TaskDocumentPage } from "@/src/modules/TaskDocument/task-document-page";

export const taskDocumentRoute: RouteObject = {
  path: "task-document",
  element: <TaskDocumentPage />,
};
