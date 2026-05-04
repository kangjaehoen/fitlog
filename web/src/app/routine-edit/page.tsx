import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createEmptyRoutineEditorData,
  getRoutineEditor,
} from "@/features/routine-editor/api";
import { RoutineEditorScreen } from "@/features/routine-editor/components/routine-editor-screen";

const AUTH_COOKIE_KEY = "fitlog_auth_token";

export const metadata = {
  title: "루틴 편집",
};

type RoutineEditPageProps = {
  searchParams?: Promise<{
    mode?: string | string[];
    routineId?: string | string[];
  }>;
};

export default async function RoutineEditPage({
  searchParams,
}: RoutineEditPageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_KEY)?.value;
  if (!token) {
    redirect("/");
  }

  const params = await searchParams;
  const createNew = params?.mode === "create";
  const routineIdParam = Array.isArray(params?.routineId)
    ? params?.routineId[0]
    : params?.routineId;
  const routineId = routineIdParam ? Number(routineIdParam) : undefined;
  const routine = createNew
    ? createEmptyRoutineEditorData()
    : await getRoutineEditor(
        token,
        Number.isFinite(routineId) ? routineId : undefined,
      );

  return <RoutineEditorScreen data={routine} createNew={createNew} />;
}
