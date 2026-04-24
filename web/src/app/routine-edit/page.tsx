import { getRoutineEditor } from "@/features/routine-editor/api";
import { RoutineEditorScreen } from "@/features/routine-editor/components/routine-editor-screen";

export const metadata = {
  title: "루틴 편집",
};

export default async function RoutineEditPage() {
  const routine = await getRoutineEditor();

  return <RoutineEditorScreen data={routine} />;
}
