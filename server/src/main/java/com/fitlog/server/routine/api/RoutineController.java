package com.fitlog.server.routine.api;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.fitlog.server.routine.application.RoutineService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/routines")
public class RoutineController {

	private final RoutineService routineService;

	public RoutineController(RoutineService routineService) {
		this.routineService = routineService;
	}

	@GetMapping("/editor")
	public RoutineService.RoutineEditorResponse getRoutineEditor(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader
	) {
		try {
			return this.routineService.getRoutineEditor(extractBearerToken(authorizationHeader));
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
		}
	}

	@GetMapping("/{routineId}/editor")
	public RoutineService.RoutineEditorResponse getRoutineEditor(
		@PathVariable Long routineId,
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader
	) {
		try {
			return this.routineService.getRoutineEditor(extractBearerToken(authorizationHeader), routineId);
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Routine not found");
		}
	}

	@PostMapping
	public RoutineService.RoutineEditorResponse saveRoutine(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
		@Valid @RequestBody RoutineSaveRequest request
	) {
		try {
			return this.routineService.saveRoutine(extractBearerToken(authorizationHeader), request.toCommand());
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
		}
	}

	@PostMapping("/{routineId}")
	public RoutineService.RoutineEditorResponse updateRoutine(
		@PathVariable Long routineId,
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
		@Valid @RequestBody RoutineSaveRequest request
	) {
		try {
			return this.routineService.updateRoutine(
				extractBearerToken(authorizationHeader),
				routineId,
				request.toCommand()
			);
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Routine not found");
		}
	}

	@PostMapping("/{routineId}/delete")
	public Map<String, Boolean> deleteRoutine(
		@PathVariable Long routineId,
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader
	) {
		try {
			this.routineService.deleteRoutine(extractBearerToken(authorizationHeader), routineId);
			return Map.of("ok", true);
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Routine not found");
		}
	}

	@PostMapping("/reorder")
	public Map<String, Boolean> reorderRoutines(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
		@Valid @RequestBody RoutineReorderRequest request
	) {
		try {
			this.routineService.reorderRoutines(extractBearerToken(authorizationHeader), request.routineIds());
			return Map.of("ok", true);
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid routine order");
		}
	}

	private static String extractBearerToken(String authorizationHeader) {
		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
			throw new IllegalArgumentException("Missing bearer token");
		}

		return authorizationHeader.substring("Bearer ".length());
	}

	public record RoutineSaveRequest(
		@NotBlank String name,
		@NotNull List<@NotNull DayOfWeek> activeDays,
		@NotEmpty List<@Valid RoutineExerciseRequest> exercises,
		Boolean createNew
	) {

		private RoutineService.RoutineSaveCommand toCommand() {
			return new RoutineService.RoutineSaveCommand(
				this.name,
				this.activeDays,
				this.exercises.stream().map(RoutineExerciseRequest::toCommand).toList(),
				Boolean.TRUE.equals(this.createNew)
			);
		}
	}

	public record RoutineExerciseRequest(
		@NotBlank String name,
		@NotBlank String group,
		@NotEmpty List<@Valid RoutineSetRequest> sets
	) {

		private RoutineService.RoutineExerciseCommand toCommand() {
			return new RoutineService.RoutineExerciseCommand(
				this.name,
				this.group,
				this.sets.stream().map(RoutineSetRequest::toCommand).toList()
			);
		}
	}

	public record RoutineSetRequest(
		@NotNull @DecimalMin("0.00") BigDecimal weight,
		@NotNull @Min(1) Integer reps
	) {

		private RoutineService.RoutineSetCommand toCommand() {
			return new RoutineService.RoutineSetCommand(this.weight, this.reps);
		}
	}

	public record RoutineReorderRequest(
		@NotEmpty List<@NotNull Long> routineIds
	) {
	}
}
