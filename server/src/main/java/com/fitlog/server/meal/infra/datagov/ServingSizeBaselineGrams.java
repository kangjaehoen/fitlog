package com.fitlog.server.meal.infra.datagov;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * {@code SERVING_SIZE} 문자열에서 함량 기준 그램(또는 첫 번째 숫자) 추출. 파싱 실패 시 빈값.
 */
public final class ServingSizeBaselineGrams {

	private static final Pattern GRAM_SEGMENT = Pattern.compile("(\\d+(?:[.]\\d+)?)\\s*([gG]|그램|ｇ)");
	private static final Pattern FIRST_DECIMAL = Pattern.compile("(\\d+(?:[.]\\d+)?)");

	private ServingSizeBaselineGrams() {
	}

	public static Optional<BigDecimal> parse(String servingSizeRaw) {
		if (servingSizeRaw == null || servingSizeRaw.isBlank()) {
			return Optional.empty();
		}
		String s = servingSizeRaw.strip();
		Matcher gram = GRAM_SEGMENT.matcher(s);
		if (gram.find()) {
			return Optional.of(new BigDecimal(normalizeDecimal(gram.group(1))));
		}
		Matcher first = FIRST_DECIMAL.matcher(s);
		if (first.find()) {
			return Optional.of(new BigDecimal(normalizeDecimal(first.group(1))));
		}
		return Optional.empty();
	}

	private static String normalizeDecimal(String numeric) {
		return numeric.replace(',', '.').strip();
	}
}
