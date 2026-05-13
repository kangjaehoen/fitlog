package com.fitlog.server.meal.application;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fitlog.server.meal.domain.FoodNutrientRef;
import com.fitlog.server.meal.infra.datagov.DataGovFoodNutritionApiClient;
import com.fitlog.server.meal.infra.datagov.DataGovFoodNutritionProperties;
import com.fitlog.server.meal.infra.datagov.FoodNutrientDataGovJsonMapper;

@Service
public class FoodNutrientImportService {

	private static final Logger log = LoggerFactory.getLogger(FoodNutrientImportService.class);

	private final DataGovFoodNutritionProperties props;
	private final DataGovFoodNutritionApiClient apiClient;
	private final FoodNutrientDataGovJsonMapper mapper;
	private final FoodNutrientRefWriter writer;

	public FoodNutrientImportService(
		DataGovFoodNutritionProperties props,
		DataGovFoodNutritionApiClient apiClient,
		FoodNutrientDataGovJsonMapper mapper,
		FoodNutrientRefWriter writer
	) {
		this.props = props;
		this.apiClient = apiClient;
		this.mapper = mapper;
		this.writer = writer;
	}

	public ImportStats importPaged(String foodNmKrFilter, int maxPages) {
		return importPaged(foodNmKrFilter, 1, maxPages);
	}

	public ImportStats importPaged(String foodNmKrFilter, int startPage, int maxPages) {
		if (props.serviceKey().isBlank()) {
			throw new IllegalStateException(
				"data.go.kr service-key is missing: app.data-gov-food-nutrition.service-key / DATAGOV_SERVICE_KEY"
			);
		}
		if (startPage <= 0) {
			throw new IllegalArgumentException("startPage must be greater than zero");
		}
		if (maxPages <= 0) {
			throw new IllegalArgumentException("maxPages must be greater than zero");
		}

		String filter = foodNmKrFilter != null ? foodNmKrFilter.strip() : "";
		int pageSize = props.pageSize();
		int saved = 0;
		int reportedTotal = -1;
		int pagesFetched = 0;
		int endPageInclusive = startPage + maxPages - 1;

		for (int pageNo = startPage; pageNo <= endPageInclusive; pageNo++) {
			JsonNode root = apiClient.fetchJsonPage(pageNo, pageSize, filter);
			mapper.assertNormalResult(root);
			if (reportedTotal < 0) {
				reportedTotal = mapper.readTotalCount(root);
				log.info("food nutrient import started reportedTotal={}, pageSize={}, startPage={}, maxPages={}, filter='{}'",
					reportedTotal, pageSize, startPage, maxPages, filter);
			}

			List<FoodNutrientRef> rows = mapper.mapItems(root);
			pagesFetched = pageNo;
			if (rows.isEmpty()) {
				break;
			}
			writer.saveAll(rows);
			saved += rows.size();

			if (pageNo < endPageInclusive) {
				sleepPause();
			}

			if (rows.size() < pageSize) {
				break;
			}
		}

		log.info("food nutrient import finished rowsSaved={}, apiPagesFetched={}, reportedTotal={}",
			saved, pagesFetched, reportedTotal);
		return new ImportStats(reportedTotal <= 0 ? 0 : reportedTotal, pagesFetched, saved);
	}

	private void sleepPause() {
		int ms = props.pauseMsBetweenRequests();
		if (ms <= 0) {
			return;
		}
		try {
			Thread.sleep(ms);
		}
		catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			throw new IllegalStateException("import interrupted", e);
		}
	}

	public record ImportStats(int reportedTotalCount, int pagesFetched, int rowsSaved) {
	}
}
