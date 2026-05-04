package com.fitlog.server.meal.domain;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MealLogRepository extends JpaRepository<MealLog, Long> {

	List<MealLog> findByUserIdAndLoggedDate(Long userId, LocalDate loggedDate);

	Optional<MealLog> findByUserIdAndLoggedDateAndMealType(Long userId, LocalDate loggedDate, MealType mealType);

	List<MealLog> findByUserIdAndLoggedDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

	@Query("""
		select distinct mealLog.loggedDate
		from MealLog mealLog
		where mealLog.userId = :userId
			and mealLog.loggedDate between :startDate and :endDate
		""")
	List<LocalDate> findLoggedDatesByUserIdBetween(
		@Param("userId") Long userId,
		@Param("startDate") LocalDate startDate,
		@Param("endDate") LocalDate endDate
	);
}
