import { apiClient } from "@/lib/api-client";

export type FoodNutrientRefSearchItem = {
  foodCd: string;
  foodNameKr: string;
  foodCat1Nm: string | null;
  foodCat2Nm: string | null;
  servingSize: string;
  nutrientBaselineG: number | null;
  energyKcal: number | null;
};

export async function searchFoodNutrientRefs(
  query: string,
  limit = 8,
): Promise<FoodNutrientRefSearchItem[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const url = `/api/food-nutrient-refs/search?query=${encodeURIComponent(
    trimmed,
  )}&limit=${limit}`;
  return apiClient.get<FoodNutrientRefSearchItem[]>(url, { cache: "no-store" });
}

