package com.fitlog.server.goal.domain;

import java.math.BigDecimal;
import java.time.LocalDate;

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
	name = "goals",
	indexes = {
		@Index(name = "idx_goals_user_active", columnList = "user_id, active")
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Goal extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "title", length = 80)
	private String title;

	@Column(name = "start_date")
	private LocalDate startDate;

	@Column(name = "end_date")
	private LocalDate endDate;

	@Column(name = "target_weight_kg", precision = 5, scale = 2)
	private BigDecimal targetWeightKg;

	@Column(name = "daily_calorie_goal")
	private Integer dailyCalorieGoal;

	@Column(name = "daily_carb_goal_g", precision = 6, scale = 2)
	private BigDecimal dailyCarbGoalG;

	@Column(name = "daily_protein_goal_g", precision = 6, scale = 2)
	private BigDecimal dailyProteinGoalG;

	@Column(name = "daily_fat_goal_g", precision = 6, scale = 2)
	private BigDecimal dailyFatGoalG;

	@Column(name = "weekly_workout_goal")
	private Integer weeklyWorkoutGoal;

	@Column(name = "active", nullable = false)
	private boolean active = true;
}
