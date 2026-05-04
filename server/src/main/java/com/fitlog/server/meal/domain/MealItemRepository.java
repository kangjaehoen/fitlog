package com.fitlog.server.meal.domain;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MealItemRepository extends JpaRepository<MealItem, Long> {

	List<MealItem> findByMealLogIdIn(Collection<Long> mealLogIds);
}
