import { apiClient } from "@/lib/api-client";
import { useRealApi } from "@/lib/api-mode";
import { homeDashboardMock } from "./mock-data";
import type { HomeDashboard } from "./types";

export async function getHomeDashboard(): Promise<HomeDashboard> {
  if (!useRealApi) {
    return homeDashboardMock;
  }

  return apiClient.get<HomeDashboard>("/api/home/dashboard", {
    cache: "no-store",
  });
}
