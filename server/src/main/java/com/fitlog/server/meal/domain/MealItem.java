package com.fitlog.server.meal.domain;

import java.math.BigDecimal;

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
	name = "meal_items",
	indexes = {
		@Index(name = "idx_meal_items_meal_log", columnList = "meal_log_id")
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MealItem extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "meal_log_id", nullable = false)
	private Long mealLogId;

	@Column(name = "food_name", nullable = false, length = 100)
	private String foodName;

	@Column(name = "quantity", nullable = false, precision = 8, scale = 2)
	private BigDecimal quantity;

	@Enumerated(EnumType.STRING)
	@Column(name = "quantity_unit", nullable = false, length = 20)
	private QuantityUnit quantityUnit = QuantityUnit.SERVING;

	@Column(name = "calories_kcal")
	private Integer caloriesKcal;

	@Column(name = "carb_g", precision = 6, scale = 2)
	private BigDecimal carbG;

	@Column(name = "protein_g", precision = 6, scale = 2)
	private BigDecimal proteinG;

	@Column(name = "fat_g", precision = 6, scale = 2)
	private BigDecimal fatG;

	private MealItem(
		Long mealLogId,
		String foodName,
		BigDecimal quantity,
		QuantityUnit quantityUnit,
		Integer caloriesKcal,
		BigDecimal carbG,
		BigDecimal proteinG,
		BigDecimal fatG
	) {
		this.mealLogId = mealLogId;
		this.foodName = foodName;
		this.quantity = quantity;
		this.quantityUnit = quantityUnit;
		this.caloriesKcal = caloriesKcal;
		this.carbG = carbG;
		this.proteinG = proteinG;
		this.fatG = fatG;
	}

	public static MealItem create(
		Long mealLogId,
		String foodName,
		BigDecimal quantity,
		QuantityUnit quantityUnit,
		Integer caloriesKcal,
		BigDecimal carbG,
		BigDecimal proteinG,
		BigDecimal fatG
	) {
		return new MealItem(mealLogId, foodName, quantity, quantityUnit, caloriesKcal, carbG, proteinG, fatG);
	}
}
