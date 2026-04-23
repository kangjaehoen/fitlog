package com.fitlog.server.meal.domain;

import java.time.LocalDate;

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
	name = "meal_logs",
	indexes = {
		@Index(name = "idx_meal_logs_user_date", columnList = "user_id, logged_date")
	},
	uniqueConstraints = {
		@UniqueConstraint(name = "uk_meal_logs_user_date_type", columnNames = {"user_id", "logged_date", "meal_type"})
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MealLog extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Enumerated(EnumType.STRING)
	@Column(name = "meal_type", nullable = false, length = 20)
	private MealType mealType;

	@Column(name = "logged_date", nullable = false)
	private LocalDate loggedDate;

	@Column(name = "memo", length = 500)
	private String memo;
}
