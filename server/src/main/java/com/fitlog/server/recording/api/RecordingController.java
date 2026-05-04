package com.fitlog.server.recording.api;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.fitlog.server.meal.domain.MealType;
import com.fitlog.server.meal.domain.QuantityUnit;
import com.fitlog.server.recording.application.RecordingService;
import com.fitlog.server.workout.domain.WorkoutIntensity;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/records")
public class RecordingController {

	private final RecordingService recordingService;

	public RecordingController(RecordingService recordingService) {
		this.recordingService = recordingService;
	}

	@GetMapping("/body-metrics/draft")
	public RecordingService.BodyInfoDraftResponse getBodyInfoDraft(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader
	) {
		try {
			return this.recordingService.getBodyInfoDraft(extractBearerToken(authorizationHeader));
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
		}
	}

	@GetMapping("/meals/today")
	public RecordingService.MealLogDataResponse getMealLog(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader
	) {
		try {
			return this.recordingService.getMealLog(extractBearerToken(authorizationHeader));
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
		}
	}

	@GetMapping("/workouts/today")
	public RecordingService.WorkoutLogDataResponse getWorkoutLog(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader
	) {
		try {
			return this.recordingService.getWorkoutLog(extractBearerToken(authorizationHeader));
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
		}
	}

	@PostMapping("/meals")
	public Map<String, Boolean> recordMeal(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
		@Valid @RequestBody MealRecordRequest request
	) {
		try {
			this.recordingService.recordMeal(extractBearerToken(authorizationHeader), request.toCommand());
			return Map.of("ok", true);
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
		}
	}

	@PostMapping("/workouts")
	public Map<String, Boolean> recordWorkout(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
		@Valid @RequestBody WorkoutRecordRequest request
	) {
		try {
			this.recordingService.recordWorkout(extractBearerToken(authorizationHeader), request.toCommand());
			return Map.of("ok", true);
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
		}
	}

	@PostMapping("/body-metrics")
	public Map<String, Boolean> recordBodyMetric(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
		@Valid @RequestBody BodyMetricRequest request
	) {
		try {
			this.recordingService.recordBodyMetric(extractBearerToken(authorizationHeader), request.toCommand());
			return Map.of("ok", true);
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

	public record MealRecordRequest(
		@NotNull MealType mealType,
		@NotBlank String foodName,
		@NotNull @DecimalMin("0.01") BigDecimal quantity,
		@NotNull QuantityUnit quantityUnit,
		@NotNull @Min(0) Integer caloriesKcal,
		BigDecimal carbG,
		BigDecimal proteinG,
		BigDecimal fatG
	) {

		private RecordingService.MealRecordCommand toCommand() {
			return new RecordingService.MealRecordCommand(
				this.mealType,
				this.foodName,
				this.quantity,
				this.quantityUnit,
				this.caloriesKcal,
				this.carbG,
				this.proteinG,
				this.fatG
			);
		}
	}

	public record WorkoutRecordRequest(
		@NotNull @Min(0) Integer durationMinutes,
		@NotNull @Min(0) Integer caloriesBurned,
		@NotNull WorkoutIntensity intensity,
		@NotEmpty List<@Valid WorkoutExerciseRequest> exercises
	) {

		private RecordingService.WorkoutRecordCommand toCommand() {
			return new RecordingService.WorkoutRecordCommand(
				this.durationMinutes,
				this.caloriesBurned,
				this.intensity,
				this.exercises.stream().map(WorkoutExerciseRequest::toCommand).toList()
			);
		}
	}

	public record WorkoutExerciseRequest(
		@NotBlank String name,
		List<@Valid WorkoutSetRequest> sets
	) {

		private RecordingService.WorkoutExerciseCommand toCommand() {
			return new RecordingService.WorkoutExerciseCommand(
				this.name,
				this.sets == null ? List.of() : this.sets.stream().map(WorkoutSetRequest::toCommand).toList()
			);
		}
	}

	public record WorkoutSetRequest(
		BigDecimal weightKg,
		Integer repetitions,
		boolean completed
	) {

		private RecordingService.WorkoutSetCommand toCommand() {
			return new RecordingService.WorkoutSetCommand(this.weightKg, this.repetitions, this.completed);
		}
	}

	public record BodyMetricRequest(
		BigDecimal weightKg,
		BigDecimal skeletalMuscleKg,
		BigDecimal bodyFatPercent
	) {

		private RecordingService.BodyMetricCommand toCommand() {
			return new RecordingService.BodyMetricCommand(this.weightKg, this.skeletalMuscleKg, this.bodyFatPercent);
		}
	}
}
