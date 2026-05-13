package com.fitlog.server.meal.infra.datagov;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;

@Component
public class DataGovFoodNutritionApiClient {

	private final DataGovFoodNutritionProperties props;
	private final RestClient http;

	public DataGovFoodNutritionApiClient(DataGovFoodNutritionProperties props) {
		this.props = props;
		this.http = RestClient.create();
	}

	/**
	 * 공공데이터포털 [식품영양성분DB정보](https://www.data.go.kr/data/15127578/openapi.do) 호출 결과(JSON).
	 */
	public JsonNode fetchJsonPage(int pageNo, int numOfRows, String foodNameKr) {
		String key = props.serviceKey();
		if (key.isBlank()) {
			throw new IllegalStateException("app.data-gov-food-nutrition.service-key 미설정");
		}

		String fullWithoutQuery = props.baseUrl() + props.inquiryOperation();
		StringBuilder query = new StringBuilder(fullWithoutQuery)
			.append("?serviceKey=").append(urlEncode(key))
			.append("&pageNo=").append(pageNo)
			.append("&numOfRows=").append(numOfRows)
			.append("&type=json");
		if (foodNameKr != null && !foodNameKr.isBlank()) {
			query.append("&FOOD_NM_KR=").append(urlEncode(foodNameKr.strip()));
		}

		URI uri = URI.create(query.toString());

		JsonNode root = http.get()
			.uri(uri)
			.retrieve()
			.body(JsonNode.class);
		if (root == null) {
			throw new IllegalStateException("공공데이터포털 응답이 비어있습니다.");
		}
		return root;
	}

	private static String urlEncode(String value) {
		return URLEncoder.encode(value, StandardCharsets.UTF_8);
	}
}
