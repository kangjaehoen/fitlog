package com.fitlog.server.workout.domain;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutExerciseRepository extends JpaRepository<WorkoutExercise, Long> {

	List<WorkoutExercise> findBySessionId(Long sessionId);

	List<WorkoutExercise> findBySessionIdIn(Collection<Long> sessionIds);
}
