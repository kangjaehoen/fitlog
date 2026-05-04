package com.fitlog.server.content.api;

import java.time.LocalDate;

import org.springframework.http.HttpStatus;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.fitlog.server.content.application.AppContentService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api")
public class AppContentController {

	private final AppContentService appContentService;

	public AppContentController(AppContentService appContentService) {
		this.appContentService = appContentService;
	}

	@GetMapping("/home/dashboard")
	public AppContentService.HomeDashboardResponse getHomeDashboard(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader
	) {
		try {
			return this.appContentService.getHomeDashboard(extractBearerToken(authorizationHeader));
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
		}
	}

	@GetMapping("/account/profile")
	public AppContentService.ProfileScreenResponse getProfileScreen(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader
	) {
		try {
			return this.appContentService.getProfileScreen(extractBearerToken(authorizationHeader));
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
		}
	}

	@RequestMapping(value = "/account/profile", method = { RequestMethod.PATCH, RequestMethod.POST })
	public AppContentService.ProfileScreenResponse updateProfileScreen(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
		@Valid @RequestBody UpdateProfileRequest request
	) {
		try {
			return this.appContentService.updateProfileNickname(
				extractBearerToken(authorizationHeader),
				request.nickname().trim()
			);
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
		}
	}

	@GetMapping("/routines/overview")
	public AppContentService.RoutineOverviewResponse getRoutineOverview(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader
	) {
		try {
			return this.appContentService.getRoutineOverview(extractBearerToken(authorizationHeader));
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
		}
	}

	@GetMapping("/analytics/weekly")
	public AppContentService.WeeklyAnalysisResponse getWeeklyAnalysis(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
		@RequestParam(value = "weekStart", required = false)
		@DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart
	) {
		try {
			return this.appContentService.getWeeklyAnalysis(extractBearerToken(authorizationHeader), weekStart);
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
		}
	}

	private static String extractBearerToken(String authorizationHeader) {
		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
			throw new IllegalArgumentException("Missing bearer token");
		}

		return authorizationHeader.substring("Bearer ".length());
	}

	public record UpdateProfileRequest(
		@NotBlank @Size(max = 40) String nickname
	) {
	}
}
