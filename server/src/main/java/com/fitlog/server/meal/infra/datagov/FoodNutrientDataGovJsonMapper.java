package com.fitlog.server.meal.infra.datagov;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fitlog.server.meal.domain.FoodNutrientRef;

/**
 * 공공데이터포털 JSON({@code response.body.items.item})을 {@link FoodNutrientRef}로 매핑합니다.
 * 필드명은 포털 출력메시지(대문자 스네이크)를 우선하며, 소문자 변형도 일부 허용합니다.
 */
@Component
public class FoodNutrientDataGovJsonMapper {

	public List<FoodNutrientRef> mapItems(JsonNode root) {
		JsonNode itemsNode = bodyNode(root).path("items");
		JsonNode itemNode = itemsNode.path("item");
		if (itemNode.isMissingNode() && itemsNode.isArray()) {
			itemNode = itemsNode;
		}
		if (itemNode.isMissingNode() || itemNode.isNull()) {
			return List.of();
		}
		List<FoodNutrientRef> out = new ArrayList<>();
		if (itemNode.isArray()) {
			for (JsonNode n : itemNode) {
				mapOne(n).ifPresent(out::add);
			}
		}
		else {
			mapOne(itemNode).ifPresent(out::add);
		}
		return out;
	}

	public void assertNormalResult(JsonNode root) {
		JsonNode header = headerNode(root);
		if (header.isMissingNode() || header.isNull()) {
			return;
		}
		String code = textAny(header, "resultCode", "returnAuthMsgCode");
		if (code.isBlank()) {
			return;
		}
		if ("00".equals(code)) {
			return;
		}
		String msg = textAny(header, "resultMsg", "returnAuthMsg");
		throw new IllegalStateException("공공데이터포털 오류: resultCode=" + code + " msg=" + msg);
	}

	public int readTotalCount(JsonNode root) {
		JsonNode body = bodyNode(root);
		JsonNode total = body.get("totalCount");
		if (total == null || total.isNull()) {
			return 0;
		}
		if (total.isInt()) {
			return total.intValue();
		}
		try {
			return Integer.parseInt(total.asText().strip());
		}
		catch (NumberFormatException ex) {
			return 0;
		}
	}

	private static JsonNode headerNode(JsonNode root) {
		JsonNode responseHeader = root.path("response").path("header");
		return responseHeader.isMissingNode() ? root.path("header") : responseHeader;
	}

	private static JsonNode bodyNode(JsonNode root) {
		JsonNode responseBody = root.path("response").path("body");
		return responseBody.isMissingNode() ? root.path("body") : responseBody;
	}

	private java.util.Optional<FoodNutrientRef> mapOne(JsonNode node) {
		String foodCd = textAny(node, "FOOD_CD", "foodCd");
		String foodNm = truncate(textAny(node, "FOOD_NM_KR", "foodNmKr"), 500);
		if (foodCd.isBlank()) {
			return java.util.Optional.empty();
		}
		if (foodNm.isBlank()) {
			foodNm = "(이름없음)";
		}

		String servingSize = truncate(textAny(node, "SERVING_SIZE", "servingSize"), 200);
		if (servingSize.isBlank()) {
			servingSize = "미상";
		}

		var baseline = ServingSizeBaselineGrams.parse(textAny(node, "SERVING_SIZE", "servingSize"));

		return java.util.Optional.of(FoodNutrientRef.create(
			truncate(foodCd, 32),
			foodNm,
			nullableTruncate(textAny(node, "DB_GRP_CM", "dbGrpCm"), 32),
			nullableTruncate(textAny(node, "DB_GRP_NM", "dbGrpNm"), 200),
			nullableTruncate(textAny(node, "FOOD_CAT1_CD", "foodCat1Cd"), 32),
			nullableTruncate(textAny(node, "FOOD_CAT1_NM", "foodCat1Nm"), 200),
			nullableTruncate(textAny(node, "FOOD_CAT2_CD", "foodCat2Cd"), 32),
			nullableTruncate(textAny(node, "FOOD_CAT2_NM", "foodCat2Nm"), 200),
			servingSize,
			baseline.orElse(null),
			decimal(textAny(node, "AMT_NUM1", "amtNum1")),
			decimal(textAny(node, "AMT_NUM3", "amtNum3")),
			decimal(textAny(node, "AMT_NUM4", "amtNum4")),
			decimal(textAny(node, "AMT_NUM6", "amtNum6")),
			decimal(textAny(node, "AMT_NUM7", "amtNum7")),
			decimal(textAny(node, "AMT_NUM13", "amtNum13")),
			nullableTruncate(textAny(node, "NUTRI_AMOUNT_SERVING", "nutriAmountServing"), 500),
			nullableTruncate(textAny(node, "Z10500", "z10500", "foodWeight"), 500),
			nullableTruncate(textAny(node, "DISH_ONE_SERVING", "dishOneServing"), 500),
			nullableTruncate(textAny(node, "RESEARCH_YMD", "researchYmd"), 20),
			nullableTruncate(textAny(node, "UPDATE_DATE", "updateDate"), 30)
		));
	}

	private static String textAny(JsonNode node, String... keys) {
		for (String key : keys) {
			JsonNode v = node.get(key);
			if (v != null && !v.isNull() && !v.asText().isBlank()) {
				return v.asText().strip();
			}
		}
		Iterator<String> fieldNames = node.fieldNames();
		while (fieldNames.hasNext()) {
			String name = fieldNames.next();
			for (String key : keys) {
				if (name.equalsIgnoreCase(key)) {
					JsonNode v = node.get(name);
					if (v != null && !v.isNull() && !v.asText().isBlank()) {
						return v.asText().strip();
					}
				}
			}
		}
		return "";
	}

	private static String truncate(String s, int max) {
		if (s == null) {
			return "";
		}
		if (s.length() <= max) {
			return s;
		}
		return s.substring(0, max);
	}

	private static String nullableTruncate(String s, int max) {
		if (s == null || s.isBlank()) {
			return null;
		}
		return truncate(s, max);
	}

	private static BigDecimal decimal(String raw) {
		if (raw == null || raw.isBlank()) {
			return null;
		}
		String t = raw.strip().replace(",", "");
		if ("N/A".equalsIgnoreCase(t) || "-".equals(t) || "null".equalsIgnoreCase(t)) {
			return null;
		}
		try {
			return new BigDecimal(t);
		}
		catch (NumberFormatException ex) {
			return null;
		}
	}
}
