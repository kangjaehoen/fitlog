package com.fitlog.server.workout.domain;

import java.math.BigDecimal;

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
	name = "workout_sets",
	indexes = {
		@Index(name = "idx_workout_sets_exercise_order", columnList = "workout_exercise_id, set_order")
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkoutSet extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "workout_exercise_id", nullable = false)
	private Long workoutExerciseId;

	@Column(name = "set_order", nullable = false)
	private int setOrder;

	@Column(name = "weight_kg", precision = 6, scale = 2)
	private BigDecimal weightKg;

	@Column(name = "repetitions")
	private Integer repetitions;

	@Column(name = "completed", nullable = false)
	private boolean completed = false;
}
