package com.fitlog.server.meal.application;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fitlog.server.meal.domain.FoodNutrientRef;
import com.fitlog.server.meal.domain.FoodNutrientRefRepository;

@Service
public class FoodNutrientRefWriter {

	private final FoodNutrientRefRepository foodNutrientRefRepository;

	public FoodNutrientRefWriter(FoodNutrientRefRepository foodNutrientRefRepository) {
		this.foodNutrientRefRepository = foodNutrientRefRepository;
	}

	@Transactional
	public void saveAll(List<FoodNutrientRef> batch) {
		this.foodNutrientRefRepository.saveAll(batch);
	}
}
