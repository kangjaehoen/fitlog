import { apiClient } from "@/lib/api-client";
import type { FaqDetail, FaqSummary } from "./types";

export async function getFaqList(): Promise<FaqSummary[]> {
  return apiClient.get<FaqSummary[]>("/api/faqs", {
    cache: "no-store",
  });
}

export async function getFaqDetail(faqId: string): Promise<FaqDetail> {
  return apiClient.get<FaqDetail>(`/api/faqs/${faqId}`, {
    cache: "no-store",
  });
}
