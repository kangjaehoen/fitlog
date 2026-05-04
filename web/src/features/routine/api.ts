import { apiClient } from "@/lib/api-client";
import type { RoutineOverview } from "./types";

type ApiOkResponse = {
  ok: boolean;
};

function authorizationHeaders(token?: string | null) {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined;
}

export async function getRoutineOverview(token?: string): Promise<RoutineOverview> {
  return apiClient.get<RoutineOverview>("/api/routines/overview", {
    cache: "no-store",
    headers: authorizationHeaders(token),
  });
}

export async function deleteRoutine(
  routineId: number,
  token: string | null,
): Promise<ApiOkResponse> {
  if (!token) {
    throw new Error("AUTH_REQUIRED");
  }

  return apiClient.post<ApiOkResponse>(`/api/routines/${routineId}/delete`, undefined, {
    cache: "no-store",
    headers: authorizationHeaders(token),
  });
}

export async function reorderRoutines(
  routineIds: number[],
  token: string | null,
): Promise<ApiOkResponse> {
  if (!token) {
    throw new Error("AUTH_REQUIRED");
  }

  return apiClient.post<ApiOkResponse>(
    "/api/routines/reorder",
    { routineIds },
    {
      cache: "no-store",
      headers: authorizationHeaders(token),
    },
  );
}
