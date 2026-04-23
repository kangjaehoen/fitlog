package com.fitlog.server.body.domain;

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
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
	name = "body_metrics",
	indexes = {
		@Index(name = "idx_body_metrics_user_measured_on", columnList = "user_id, measured_on")
	},
	uniqueConstraints = {
		@UniqueConstraint(name = "uk_body_metrics_user_measured_on", columnNames = {"user_id", "measured_on"})
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BodyMetric extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "measured_on", nullable = false)
	private LocalDate measuredOn;

	@Column(name = "weight_kg", precision = 5, scale = 2)
	private BigDecimal weightKg;

	@Column(name = "skeletal_muscle_kg", precision = 5, scale = 2)
	private BigDecimal skeletalMuscleKg;

	@Column(name = "body_fat_percent", precision = 5, scale = 2)
	private BigDecimal bodyFatPercent;
}
