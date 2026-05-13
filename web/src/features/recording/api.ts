import { apiClient } from "@/lib/api-client";
import type { BodyInfoDraft, MealLogData, WorkoutLogData } from "./types";

type ApiOkResponse = {
  ok: boolean;
};

export type WorkoutRecordPayload = {
  durationMinutes: number;
  caloriesBurned: number;
  intensity: "EASY" | "MODERATE" | "HARD";
  exercises: Array<{
    name: string;
    sets: Array<{
      weightKg: number;
      repetitions: number;
      completed: boolean;
    }>;
  }>;
};

export type BodyMetricRecordPayload = {
  weightKg: number | null;
  skeletalMuscleKg: number | null;
  bodyFatPercent: number | null;
};

export type MealRecordPayload = {
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
  foodName: string;
  foodCd?: string | null;
  quantity: number;
  quantityUnit: "SERVING" | "GRAM";
  caloriesKcal: number;
  carbG?: number | null;
  proteinG?: number | null;
  fatG?: number | null;
};

function authorizationHeaders(token?: string | null) {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined;
}

export async function getBodyInfoDraft(token?: string): Promise<BodyInfoDraft> {
  return apiClient.get<BodyInfoDraft>("/api/records/body-metrics/draft", {
    cache: "no-store",
    headers: authorizationHeaders(token),
  });
}

export async function getMealLog(token?: string): Promise<MealLogData> {
  return apiClient.get<MealLogData>("/api/records/meals/today", {
    cache: "no-store",
    headers: authorizationHeaders(token),
  });
}

export async function getWorkoutLog(
  token?: string,
  routineId?: number,
): Promise<WorkoutLogData> {
  const query = routineId ? `?routineId=${routineId}` : "";

  return apiClient.get<WorkoutLogData>(`/api/records/workouts/today${query}`, {
    cache: "no-store",
    headers: authorizationHeaders(token),
  });
}

export async function recordWorkout(
  payload: WorkoutRecordPayload,
  token: string | null,
): Promise<ApiOkResponse> {
  if (!token) {
    throw new Error("AUTH_REQUIRED");
  }

  return apiClient.post<ApiOkResponse>("/api/records/workouts", payload, {
    cache: "no-store",
    headers: authorizationHeaders(token),
  });
}

export async function recordBodyMetric(
  payload: BodyMetricRecordPayload,
  token: string | null,
): Promise<ApiOkResponse> {
  if (!token) {
    throw new Error("AUTH_REQUIRED");
  }

  return apiClient.post<ApiOkResponse>("/api/records/body-metrics", payload, {
    cache: "no-store",
    headers: authorizationHeaders(token),
  });
}

export async function recordMeal(
  payload: MealRecordPayload,
  token: string | null,
): Promise<ApiOkResponse> {
  if (!token) {
    throw new Error("AUTH_REQUIRED");
  }

  return apiClient.post<ApiOkResponse>("/api/records/meals", payload, {
    cache: "no-store",
    headers: authorizationHeaders(token),
  });
}
