package com.fitlog.server.meal.api;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.fitlog.server.meal.application.FoodNutrientImportService;
import com.fitlog.server.meal.infra.datagov.DataGovFoodNutritionProperties;

import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/api/internal/food-nutrient-import")
@ConditionalOnProperty(prefix = "app.data-gov-food-nutrition", name = "import-http-enabled", havingValue = "true")
public class FoodNutrientImportController {

	public static final String IMPORT_SECRET_HEADER = "X-FitLog-Food-Import-Secret";

	private final DataGovFoodNutritionProperties props;
	private final FoodNutrientImportService foodNutrientImportService;

	public FoodNutrientImportController(
		DataGovFoodNutritionProperties props,
		FoodNutrientImportService foodNutrientImportService
	) {
		this.props = props;
		this.foodNutrientImportService = foodNutrientImportService;
	}

	@PostConstruct
	void validateSecretConfigured() {
		if (props.importSecret() == null || props.importSecret().isBlank()) {
			throw new IllegalStateException(
				"app.data-gov-food-nutrition.import-secret is required when import-http-enabled is true"
			);
		}
	}

	@PostMapping("/run")
	public FoodNutrientImportService.ImportStats run(
		@RequestHeader(IMPORT_SECRET_HEADER) String secret,
		@RequestParam(name = "foodNmKr", required = false) String foodNmKr,
		@RequestParam(name = "startPage", defaultValue = "1") int startPage,
		@RequestParam(name = "maxPages", defaultValue = "100") int maxPages
	) {
		if (!props.importSecret().equals(secret.strip())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN);
		}
		return this.foodNutrientImportService.importPaged(foodNmKr, startPage, maxPages);
	}
}
