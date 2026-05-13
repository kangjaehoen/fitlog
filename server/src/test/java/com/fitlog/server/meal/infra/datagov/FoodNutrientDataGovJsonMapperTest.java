package com.fitlog.server.meal.infra.datagov;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

class FoodNutrientDataGovJsonMapperTest {

	private final FoodNutrientDataGovJsonMapper mapper = new FoodNutrientDataGovJsonMapper();
	private final ObjectMapper om = new ObjectMapper();

	@Test
	void mapsItemArrayToRefs() throws Exception {
		String json = """
				{"response":{"header":{"resultCode":"00","resultMsg":"NORMAL SERVICE"},
				"body":{"totalCount":"1","pageNo":"1","numOfRows":"10",
				"items":{"item":[{"FOOD_CD":"D000001","FOOD_NM_KR":"테스트미역국","SERVING_SIZE":"100g",
				"AMT_NUM1":"30","AMT_NUM3":"2.1","AMT_NUM4":"0.9","AMT_NUM6":"3.5",
				"AMT_NUM7":"0.5","AMT_NUM13":"400","Z10500":"200g"}]}}}}""";
		var root = om.readTree(json);
		mapper.assertNormalResult(root);
		var refs = mapper.mapItems(root);
		assertThat(refs).hasSize(1);
		var r = refs.get(0);
		assertThat(r.getFoodCd()).isEqualTo("D000001");
		assertThat(r.getFoodNameKr()).isEqualTo("테스트미역국");
		assertThat(r.getServingSize()).isEqualTo("100g");
		assertThat(r.getNutrientBaselineG()).hasToString("100");
		assertThat(r.getEnergyKcal()).hasToString("30");
		assertThat(r.getProteinG()).hasToString("2.1");
		assertThat(r.getFatG()).hasToString("0.9");
		assertThat(r.getCarbG()).hasToString("3.5");
		assertThat(r.getSugarG()).hasToString("0.5");
		assertThat(r.getSodiumMg()).hasToString("400");
		assertThat(r.getFoodWeightText()).isEqualTo("200g");
	}

	@Test
	void mapsRootBodyItemsArrayToRefs() throws Exception {
		String json = """
				{"header":{"resultCode":"00","resultMsg":"NORMAL SERVICE."},
				"body":{"totalCount":1,"pageNo":1,"numOfRows":3,
				"items":[{"FOOD_CD":"D101-004160000-0001","FOOD_NM_KR":"국밥_돼지머리","SERVING_SIZE":"100g",
				"AMT_NUM1":"137.000","AMT_NUM3":"6.70","AMT_NUM4":"5.16","AMT_NUM6":"15.94",
				"AMT_NUM7":"0.16","AMT_NUM13":"181.000","Z10500":"900.000g"}]}}""";
		var root = om.readTree(json);
		mapper.assertNormalResult(root);

		var refs = mapper.mapItems(root);

		assertThat(mapper.readTotalCount(root)).isEqualTo(1);
		assertThat(refs).hasSize(1);
		assertThat(refs.get(0).getFoodCd()).isEqualTo("D101-004160000-0001");
		assertThat(refs.get(0).getFoodNameKr()).isEqualTo("국밥_돼지머리");
		assertThat(refs.get(0).getEnergyKcal()).hasToString("137.000");
	}
}
