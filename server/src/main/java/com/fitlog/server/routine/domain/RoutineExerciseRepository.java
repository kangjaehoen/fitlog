package com.fitlog.server.routine.domain;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RoutineExerciseRepository extends JpaRepository<RoutineExercise, Long> {

	long countByRoutineId(Long routineId);

	List<RoutineExercise> findByRoutineIdOrderBySortOrderAsc(Long routineId);

	void deleteByRoutineId(Long routineId);
}
