package com.fitlog.server.content.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fitlog.server.content.application.AppContentService;

@RestController
@RequestMapping("/api")
public class AppContentController {

	private final AppContentService appContentService;

	public AppContentController(AppContentService appContentService) {
		this.appContentService = appContentService;
	}

	@GetMapping("/home/dashboard")
	public AppContentService.HomeDashboardResponse getHomeDashboard() {
		return this.appContentService.getHomeDashboard();
	}

	@GetMapping("/routines/overview")
	public AppContentService.RoutineOverviewResponse getRoutineOverview() {
		return this.appContentService.getRoutineOverview();
	}

	@GetMapping("/analytics/weekly")
	public AppContentService.WeeklyAnalysisResponse getWeeklyAnalysis() {
		return this.appContentService.getWeeklyAnalysis();
	}
}
