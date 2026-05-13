import type { WorkoutLogData } from "./types";

export type WorkoutSetDraft = WorkoutLogData["routineTemplate"][number];

export type CompletedWorkoutExercise =
  WorkoutLogData["completedExercises"][number] & {
    persistable: boolean;
    sets: WorkoutSetDraft[];
  };

export type WorkoutDraftState = {
  version: 1;
  dateKey: string;
  savedAt: number;
  seconds: number;
  running: boolean;
  exerciseName: string;
  intensity: string;
  sets: WorkoutSetDraft[];
  completedExercises: CompletedWorkoutExercise[];
  lastSavedDraftKey: string | null;
};

const WORKOUT_DRAFT_STORAGE_KEY = "fitlog.workoutDraft.v1";

function currentDraftDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function loadWorkoutDraftState() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawDraft = window.localStorage.getItem(WORKOUT_DRAFT_STORAGE_KEY);
  if (!rawDraft) {
    return null;
  }

  try {
    const draft = JSON.parse(rawDraft) as Partial<WorkoutDraftState>;
    if (
      draft.version !== 1 ||
      draft.dateKey !== currentDraftDateKey() ||
      typeof draft.savedAt !== "number" ||
      typeof draft.seconds !== "number" ||
      typeof draft.running !== "boolean" ||
      typeof draft.exerciseName !== "string" ||
      typeof draft.intensity !== "string" ||
      !Array.isArray(draft.sets) ||
      !Array.isArray(draft.completedExercises)
    ) {
      clearWorkoutDraftState();
      return null;
    }

    return draft as WorkoutDraftState;
  } catch {
    clearWorkoutDraftState();
    return null;
  }
}

export function saveWorkoutDraftState(draft: Omit<WorkoutDraftState, "dateKey">) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    WORKOUT_DRAFT_STORAGE_KEY,
    JSON.stringify({
      ...draft,
      dateKey: currentDraftDateKey(),
    }),
  );
}

export function clearWorkoutDraftState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(WORKOUT_DRAFT_STORAGE_KEY);
}

export function hasTodayWorkoutDraft() {
  return loadWorkoutDraftState() !== null;
}
