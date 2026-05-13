package com.fitlog.server.meal.domain;

import java.math.BigDecimal;

import com.fitlog.server.common.entity.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
	name = "food_nutrient_refs",
	indexes = {
		@Index(name = "idx_food_nutrient_refs_name", columnList = "food_name_kr"),
		@Index(name = "idx_food_nutrient_refs_cat1", columnList = "food_cat1_nm")
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FoodNutrientRef extends BaseTimeEntity {

	@Id
	@Column(name = "food_cd", nullable = false, length = 32)
	private String foodCd;

	@Column(name = "food_name_kr", nullable = false, length = 500)
	private String foodNameKr;

	@Column(name = "db_grp_cm", length = 32)
	private String dbGrpCm;

	@Column(name = "db_grp_nm", length = 200)
	private String dbGrpNm;

	@Column(name = "food_cat1_cd", length = 32)
	private String foodCat1Cd;

	@Column(name = "food_cat1_nm", length = 200)
	private String foodCat1Nm;

	@Column(name = "food_cat2_cd", length = 32)
	private String foodCat2Cd;

	@Column(name = "food_cat2_nm", length = 200)
	private String foodCat2Nm;

	@Column(name = "serving_size", nullable = false, length = 200)
	private String servingSize;

	@Column(name = "nutrient_baseline_g", precision = 14, scale = 4)
	private BigDecimal nutrientBaselineG;

	@Column(name = "energy_kcal", precision = 14, scale = 4)
	private BigDecimal energyKcal;

	@Column(name = "protein_g", precision = 14, scale = 4)
	private BigDecimal proteinG;

	@Column(name = "fat_g", precision = 14, scale = 4)
	private BigDecimal fatG;

	@Column(name = "carb_g", precision = 14, scale = 4)
	private BigDecimal carbG;

	@Column(name = "sugar_g", precision = 14, scale = 4)
	private BigDecimal sugarG;

	@Column(name = "sodium_mg", precision = 14, scale = 4)
	private BigDecimal sodiumMg;

	@Column(name = "nutri_amount_serving", length = 500)
	private String nutriAmountServing;

	@Column(name = "food_weight_text", length = 500)
	private String foodWeightText;

	@Column(name = "dish_one_serving", length = 500)
	private String dishOneServing;

	@Column(name = "source_research_ymd", length = 20)
	private String sourceResearchYmd;

	@Column(name = "source_update_date", length = 30)
	private String sourceUpdateDate;

	private FoodNutrientRef(
		String foodCd,
		String foodNameKr,
		String dbGrpCm,
		String dbGrpNm,
		String foodCat1Cd,
		String foodCat1Nm,
		String foodCat2Cd,
		String foodCat2Nm,
		String servingSize,
		BigDecimal nutrientBaselineG,
		BigDecimal energyKcal,
		BigDecimal proteinG,
		BigDecimal fatG,
		BigDecimal carbG,
		BigDecimal sugarG,
		BigDecimal sodiumMg,
		String nutriAmountServing,
		String foodWeightText,
		String dishOneServing,
		String sourceResearchYmd,
		String sourceUpdateDate
	) {
		this.foodCd = foodCd;
		this.foodNameKr = foodNameKr;
		this.dbGrpCm = dbGrpCm;
		this.dbGrpNm = dbGrpNm;
		this.foodCat1Cd = foodCat1Cd;
		this.foodCat1Nm = foodCat1Nm;
		this.foodCat2Cd = foodCat2Cd;
		this.foodCat2Nm = foodCat2Nm;
		this.servingSize = servingSize;
		this.nutrientBaselineG = nutrientBaselineG;
		this.energyKcal = energyKcal;
		this.proteinG = proteinG;
		this.fatG = fatG;
		this.carbG = carbG;
		this.sugarG = sugarG;
		this.sodiumMg = sodiumMg;
		this.nutriAmountServing = nutriAmountServing;
		this.foodWeightText = foodWeightText;
		this.dishOneServing = dishOneServing;
		this.sourceResearchYmd = sourceResearchYmd;
		this.sourceUpdateDate = sourceUpdateDate;
	}

	public static FoodNutrientRef create(
		String foodCd,
		String foodNameKr,
		String dbGrpCm,
		String dbGrpNm,
		String foodCat1Cd,
		String foodCat1Nm,
		String foodCat2Cd,
		String foodCat2Nm,
		String servingSize,
		BigDecimal nutrientBaselineG,
		BigDecimal energyKcal,
		BigDecimal proteinG,
		BigDecimal fatG,
		BigDecimal carbG,
		BigDecimal sugarG,
		BigDecimal sodiumMg,
		String nutriAmountServing,
		String foodWeightText,
		String dishOneServing,
		String sourceResearchYmd,
		String sourceUpdateDate
	) {
		return new FoodNutrientRef(
			foodCd,
			foodNameKr,
			dbGrpCm,
			dbGrpNm,
			foodCat1Cd,
			foodCat1Nm,
			foodCat2Cd,
			foodCat2Nm,
			servingSize,
			nutrientBaselineG,
			energyKcal,
			proteinG,
			fatG,
			carbG,
			sugarG,
			sodiumMg,
			nutriAmountServing,
			foodWeightText,
			dishOneServing,
			sourceResearchYmd,
			sourceUpdateDate
		);
	}
}
