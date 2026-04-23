package com.fitlog.server.routine.domain;

import java.time.DayOfWeek;

import com.fitlog.server.common.entity.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
	name = "routine_schedules",
	indexes = {
		@Index(name = "idx_routine_schedules_routine", columnList = "routine_id")
	},
	uniqueConstraints = {
		@UniqueConstraint(name = "uk_routine_schedules_routine_day", columnNames = {"routine_id", "day_of_week"})
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RoutineSchedule extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "routine_id", nullable = false)
	private Long routineId;

	@Enumerated(EnumType.STRING)
	@Column(name = "day_of_week", nullable = false, length = 16)
	private DayOfWeek dayOfWeek;
}
