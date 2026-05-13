package com.fitlog.server.meal.application;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fitlog.server.meal.domain.FoodNutrientRef;
import com.fitlog.server.meal.domain.FoodNutrientRefRepository;

@Service
public class FoodNutrientRefSearchService {

	private final FoodNutrientRefRepository repository;

	public FoodNutrientRefSearchService(FoodNutrientRefRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public List<FoodNutrientRef> search(String query, int limit) {
		String normalized = normalizeQuery(query);
		if (normalized.isBlank()) {
			return List.of();
		}

		int safeLimit = Math.max(1, Math.min(limit, 20));
		List<FoodNutrientRef> results = this.repository.searchByName(normalized);
		return results.size() <= safeLimit ? results : results.subList(0, safeLimit);
	}

	private static String normalizeQuery(String query) {
		if (query == null) {
			return "";
		}
		return query.trim().replace(" ", "").toLowerCase(Locale.ROOT);
	}
}

