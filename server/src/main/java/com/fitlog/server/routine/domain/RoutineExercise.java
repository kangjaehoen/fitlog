package com.fitlog.server.routine.domain;

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
	name = "routine_exercises",
	indexes = {
		@Index(name = "idx_routine_exercises_routine_order", columnList = "routine_id, sort_order")
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RoutineExercise extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "routine_id", nullable = false)
	private Long routineId;

	@Column(name = "exercise_name", nullable = false, length = 100)
	private String exerciseName;

	@Column(name = "sort_order", nullable = false)
	private int sortOrder;

	@Column(name = "notes", length = 500)
	private String notes;
}
