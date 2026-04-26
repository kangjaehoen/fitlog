import { apiClient } from "@/lib/api-client";
import { useRealApi } from "@/lib/api-mode";
import { routineOverviewMock } from "./mock-data";
import type { RoutineOverview } from "./types";

export async function getRoutineOverview(): Promise<RoutineOverview> {
  if (!useRealApi) {
    return routineOverviewMock;
  }

  return apiClient.get<RoutineOverview>("/api/routines/overview", {
    cache: "no-store",
  });
}
