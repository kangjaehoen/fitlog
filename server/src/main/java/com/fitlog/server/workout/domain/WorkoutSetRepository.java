package com.fitlog.server.workout.domain;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutSetRepository extends JpaRepository<WorkoutSet, Long> {

	List<WorkoutSet> findByWorkoutExerciseIdIn(Collection<Long> workoutExerciseIds);
}
