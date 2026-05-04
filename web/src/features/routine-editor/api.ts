import { apiClient } from "@/lib/api-client";
import type { RoutineEditorData } from "./types";

type ServerDayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

type RoutineEditorResponse = {
  id: number | null;
  name: string;
  activeDays: ServerDayOfWeek[];
  exercises: Array<{
    name: string;
    group: string | null;
    sets: Array<{
      weight: number | string | null;
      reps: number | null;
    }>;
  }>;
};

type RoutineSaveRequest = {
  name: string;
  activeDays: ServerDayOfWeek[];
  exercises: Array<{
    name: string;
    group: string;
    sets: Array<{
      weight: number;
      reps: number;
    }>;
  }>;
  createNew: boolean;
};

const dayOptions: Array<{
  key: RoutineEditorData["days"][number]["key"];
  label: string;
  serverValue: ServerDayOfWeek;
}> = [
  { key: "sun", label: "일", serverValue: "SUNDAY" },
  { key: "mon", label: "월", serverValue: "MONDAY" },
  { key: "tue", label: "화", serverValue: "TUESDAY" },
  { key: "wed", label: "수", serverValue: "WEDNESDAY" },
  { key: "thu", label: "목", serverValue: "THURSDAY" },
  { key: "fri", label: "금", serverValue: "FRIDAY" },
  { key: "sat", label: "토", serverValue: "SATURDAY" },
];

export async function getRoutineEditor(
  token?: string,
  routineId?: number,
): Promise<RoutineEditorData> {
  const path = routineId ? `/api/routines/${routineId}/editor` : "/api/routines/editor";
  const response = await apiClient.get<RoutineEditorResponse>(path, {
    cache: "no-store",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  return toRoutineEditorData(response);
}

export async function saveRoutineEditor(
  data: RoutineEditorData,
  token: string | null,
  createNew = false,
): Promise<RoutineEditorData> {
  if (!token) {
    throw new Error("AUTH_REQUIRED");
  }

  const response = await apiClient.post<RoutineEditorResponse>(
    !createNew && data.id ? `/api/routines/${data.id}` : "/api/routines",
    toRoutineSaveRequest(data, createNew),
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return toRoutineEditorData(response);
}

export function createEmptyRoutineEditorData(): RoutineEditorData {
  return {
    id: undefined,
    name: "",
    days: dayOptions.map((day) => ({
      key: day.key,
      label: day.label,
      active: false,
    })),
    exercises: [],
  };
}

function toRoutineEditorData(response: RoutineEditorResponse): RoutineEditorData {
  const activeDays = new Set(response.activeDays);

  return {
    id: response.id ?? undefined,
    name: response.name,
    days: dayOptions.map((day) => ({
      key: day.key,
      label: day.label,
      active: activeDays.has(day.serverValue),
    })),
    exercises: response.exercises.map((exercise) => ({
      name: exercise.name,
      group: exercise.group ?? "전신",
      sets: exercise.sets.map((set) => ({
        weight: Number(set.weight ?? 0),
        reps: Number(set.reps ?? 0),
      })),
    })),
  };
}

function toRoutineSaveRequest(
  data: RoutineEditorData,
  createNew: boolean,
): RoutineSaveRequest {
  const serverDayByKey = new Map(dayOptions.map((day) => [day.key, day.serverValue]));

  return {
    name: data.name.trim(),
    activeDays: data.days
      .filter((day) => day.active)
      .map((day) => serverDayByKey.get(day.key))
      .filter((day): day is ServerDayOfWeek => Boolean(day)),
    exercises: data.exercises.map((exercise) => ({
      name: exercise.name.trim(),
      group: exercise.group.trim() || "전신",
      sets: exercise.sets.map((set) => ({
        weight: set.weight,
        reps: set.reps,
      })),
    })),
    createNew,
  };
}
