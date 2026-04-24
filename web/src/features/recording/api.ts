import { bodyInfoDraftMock, mealLogMock, workoutLogMock } from "./mock-data";
import type { BodyInfoDraft, MealLogData, WorkoutLogData } from "./types";

export async function getBodyInfoDraft(): Promise<BodyInfoDraft> {
  return bodyInfoDraftMock;
}

export async function getMealLog(): Promise<MealLogData> {
  return mealLogMock;
}

export async function getWorkoutLog(): Promise<WorkoutLogData> {
  return workoutLogMock;
}
