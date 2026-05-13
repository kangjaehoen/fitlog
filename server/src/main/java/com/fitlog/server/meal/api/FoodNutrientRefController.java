package com.fitlog.server.meal.api;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fitlog.server.meal.application.FoodNutrientRefSearchService;
import com.fitlog.server.meal.domain.FoodNutrientRef;

@RestController
@RequestMapping("/api/food-nutrient-refs")
public class FoodNutrientRefController {

	private final FoodNutrientRefSearchService searchService;

	public FoodNutrientRefController(FoodNutrientRefSearchService searchService) {
		this.searchService = searchService;
	}

	@GetMapping("/search")
	public List<FoodNutrientRefSearchItemResponse> search(
		@RequestParam("query") String query,
		@RequestParam(name = "limit", defaultValue = "8") int limit
	) {
		List<FoodNutrientRef> results = this.searchService.search(query, limit);
		return results.stream().map(FoodNutrientRefSearchItemResponse::from).toList();
	}

	public record FoodNutrientRefSearchItemResponse(
		String foodCd,
		String foodNameKr,
		String foodCat1Nm,
		String foodCat2Nm,
		String servingSize,
		BigDecimal nutrientBaselineG,
		BigDecimal energyKcal
	) {
		private static FoodNutrientRefSearchItemResponse from(FoodNutrientRef ref) {
			return new FoodNutrientRefSearchItemResponse(
				ref.getFoodCd(),
				ref.getFoodNameKr(),
				ref.getFoodCat1Nm(),
				ref.getFoodCat2Nm(),
				ref.getServingSize(),
				ref.getNutrientBaselineG(),
				ref.getEnergyKcal()
			);
		}
	}
}

