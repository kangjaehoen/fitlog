import { routineEditorMock } from "./mock-data";
import type { RoutineEditorData } from "./types";

export async function getRoutineEditor(): Promise<RoutineEditorData> {
  return routineEditorMock;
}
