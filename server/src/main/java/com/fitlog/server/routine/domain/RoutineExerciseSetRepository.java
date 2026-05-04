package com.fitlog.server.routine.domain;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RoutineExerciseSetRepository extends JpaRepository<RoutineExerciseSet, Long> {

	List<RoutineExerciseSet> findByRoutineExerciseIdIn(Collection<Long> routineExerciseIds);

	void deleteByRoutineExerciseIdIn(Collection<Long> routineExerciseIds);
}
