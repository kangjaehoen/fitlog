package com.fitlog.server.workout.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
	name = "workout_sessions",
	indexes = {
		@Index(name = "idx_workout_sessions_user_date", columnList = "user_id, session_date"),
		@Index(name = "idx_workout_sessions_routine", columnList = "routine_id")
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkoutSession extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "routine_id")
	private Long routineId;

	@Column(name = "session_date", nullable = false)
	private LocalDate sessionDate;

	@Column(name = "started_at")
	private LocalDateTime startedAt;

	@Column(name = "completed_at")
	private LocalDateTime completedAt;

	@Column(name = "duration_minutes")
	private Integer durationMinutes;

	@Column(name = "calories_burned")
	private Integer caloriesBurned;

	@Enumerated(EnumType.STRING)
	@Column(name = "intensity", length = 20)
	private WorkoutIntensity intensity;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false, length = 20)
	private WorkoutStatus status = WorkoutStatus.IN_PROGRESS;

	@Column(name = "memo", length = 500)
	private String memo;
}
