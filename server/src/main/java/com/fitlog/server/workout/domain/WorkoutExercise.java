package com.fitlog.server.workout.domain;

import com.fitlog.server.common.entity.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
	name = "workout_exercises",
	indexes = {
		@Index(name = "idx_workout_exercises_session_order", columnList = "session_id, sort_order")
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkoutExercise extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "session_id", nullable = false)
	private Long sessionId;

	@Column(name = "routine_exercise_id")
	private Long routineExerciseId;

	@Column(name = "exercise_name", nullable = false, length = 100)
	private String exerciseName;

	@Column(name = "sort_order", nullable = false)
	private int sortOrder;
}
