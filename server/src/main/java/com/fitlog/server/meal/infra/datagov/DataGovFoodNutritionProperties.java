package com.fitlog.server.meal.infra.datagov;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.data-gov-food-nutrition")
public record DataGovFoodNutritionProperties(
	String serviceKey,
	String baseUrl,
	String inquiryOperation,
	boolean importHttpEnabled,
	String importSecret,
	int pageSize,
	int pauseMsBetweenRequests
) {
	public DataGovFoodNutritionProperties {
		serviceKey = serviceKey == null ? "" : serviceKey.strip();
		if (serviceKey.contains("%")) {
			serviceKey = URLDecoder.decode(serviceKey, StandardCharsets.UTF_8);
		}
		importSecret = importSecret == null ? "" : importSecret;
		if (baseUrl == null || baseUrl.isBlank()) {
			baseUrl = "https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02";
		}
		else {
			baseUrl = baseUrl.strip().replaceAll("/+$", "");
		}
		if (inquiryOperation == null || inquiryOperation.isBlank()) {
			inquiryOperation = "/getFoodNtrCpntDbInq02";
		}
		else {
			inquiryOperation = inquiryOperation.strip();
		}
		if (!inquiryOperation.startsWith("/")) {
			inquiryOperation = "/" + inquiryOperation;
		}
		if (pageSize <= 0) {
			pageSize = 100;
		}
		if (pauseMsBetweenRequests < 0) {
			pauseMsBetweenRequests = 0;
		}
	}
}
