import { apiClient } from "@/lib/api-client";
import { routineOverviewMock } from "./mock-data";
import type { RoutineOverview } from "./types";

const useRealApi = process.env.FITLOG_USE_REAL_API === "true";

export async function getRoutineOverview(): Promise<RoutineOverview> {
  if (!useRealApi) {
    return routineOverviewMock;
  }

  return apiClient.get<RoutineOverview>("/api/routines/overview", {
    cache: "no-store",
  });
}
