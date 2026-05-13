package com.fitlog.server.meal.domain;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FoodNutrientRefRepository extends JpaRepository<FoodNutrientRef, String> {
	@Query("""
		select f
		from FoodNutrientRef f
		where :queryNormalized = '' or lower(replace(f.foodNameKr, ' ', '')) like concat('%', :queryNormalized, '%')
		order by
			case when lower(replace(f.foodNameKr, ' ', '')) like concat(:queryNormalized, '%') then 0 else 1 end,
			length(f.foodNameKr) asc,
			f.foodNameKr asc
		""")
	List<FoodNutrientRef> searchByName(@Param("queryNormalized") String queryNormalized);
}
