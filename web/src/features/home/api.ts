import { apiClient } from "@/lib/api-client";
import { allowMockFallback, useRealApi } from "@/lib/api-mode";
import { homeDashboardMock } from "./mock-data";
import type { HomeDashboard } from "./types";

export async function getHomeDashboard(): Promise<HomeDashboard> {
  if (!useRealApi) {
    return homeDashboardMock;
  }

  try {
    return await apiClient.get<HomeDashboard>("/api/home/dashboard", {
      cache: "no-store",
    });
  } catch (error) {
    if (allowMockFallback) {
      return homeDashboardMock;
    }

    throw error;
  }
}
