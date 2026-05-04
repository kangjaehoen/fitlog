package com.fitlog.server.routine.domain;

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
	name = "routine_exercise_sets",
	indexes = {
		@Index(name = "idx_routine_exercise_sets_exercise_order", columnList = "routine_exercise_id, set_order")
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RoutineExerciseSet extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "routine_exercise_id", nullable = false)
	private Long routineExerciseId;

	@Column(name = "set_order", nullable = false)
	private int setOrder;

	@Column(name = "target_weight_kg", precision = 6, scale = 2)
	private BigDecimal targetWeightKg;

	@Column(name = "target_repetitions")
	private Integer targetRepetitions;

	private RoutineExerciseSet(
		Long routineExerciseId,
		int setOrder,
		BigDecimal targetWeightKg,
		Integer targetRepetitions
	) {
		this.routineExerciseId = routineExerciseId;
		this.setOrder = setOrder;
		this.targetWeightKg = targetWeightKg;
		this.targetRepetitions = targetRepetitions;
	}

	public static RoutineExerciseSet create(
		Long routineExerciseId,
		int setOrder,
		BigDecimal targetWeightKg,
		Integer targetRepetitions
	) {
		return new RoutineExerciseSet(routineExerciseId, setOrder, targetWeightKg, targetRepetitions);
	}
}
