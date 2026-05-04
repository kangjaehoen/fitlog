package com.fitlog.server.routine.application;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fitlog.server.auth.application.AuthTokenService;
import com.fitlog.server.routine.domain.Routine;
import com.fitlog.server.routine.domain.RoutineExercise;
import com.fitlog.server.routine.domain.RoutineExerciseRepository;
import com.fitlog.server.routine.domain.RoutineExerciseSet;
import com.fitlog.server.routine.domain.RoutineExerciseSetRepository;
import com.fitlog.server.routine.domain.RoutineRepository;
import com.fitlog.server.routine.domain.RoutineSchedule;
import com.fitlog.server.routine.domain.RoutineScheduleRepository;

@Service
public class RoutineService {

	private final AuthTokenService authTokenService;
	private final RoutineRepository routineRepository;
	private final RoutineExerciseRepository routineExerciseRepository;
	private final RoutineExerciseSetRepository routineExerciseSetRepository;
	private final RoutineScheduleRepository routineScheduleRepository;

	public RoutineService(
		AuthTokenService authTokenService,
		RoutineRepository routineRepository,
		RoutineExerciseRepository routineExerciseRepository,
		RoutineExerciseSetRepository routineExerciseSetRepository,
		RoutineScheduleRepository routineScheduleRepository
	) {
		this.authTokenService = authTokenService;
		this.routineRepository = routineRepository;
		this.routineExerciseRepository = routineExerciseRepository;
		this.routineExerciseSetRepository = routineExerciseSetRepository;
		this.routineScheduleRepository = routineScheduleRepository;
	}

	@Transactional(readOnly = true)
	public RoutineEditorResponse getRoutineEditor(String authToken) {
		Long userId = this.authTokenService.parseUserId(authToken);

		return this.routineRepository.findFirstByUserIdAndActiveTrueOrderByIdDesc(userId)
			.map(this::toEditorResponse)
			.orElseGet(() -> new RoutineEditorResponse(null, "", List.of(), List.of()));
	}

	@Transactional(readOnly = true)
	public RoutineEditorResponse getRoutineEditor(String authToken, Long routineId) {
		Long userId = this.authTokenService.parseUserId(authToken);

		return this.routineRepository.findByIdAndUserIdAndActiveTrue(routineId, userId)
			.map(this::toEditorResponse)
			.orElseThrow(() -> new IllegalArgumentException("Routine not found"));
	}

	@Transactional
	public RoutineEditorResponse saveRoutine(String authToken, RoutineSaveCommand command) {
		Long userId = this.authTokenService.parseUserId(authToken);
		Routine routine = command.createNew()
			? Routine.create(userId, command.name().trim(), null, nextDisplayOrder(userId))
			: this.routineRepository.findFirstByUserIdAndActiveTrueOrderByIdDesc(userId)
				.map(existingRoutine -> {
					existingRoutine.update(command.name().trim(), null);
					return existingRoutine;
				})
				.orElseGet(() -> Routine.create(userId, command.name().trim(), null, nextDisplayOrder(userId)));

		Routine savedRoutine = this.routineRepository.save(routine);
		replaceSchedules(savedRoutine.getId(), command.activeDays());
		replaceExercises(savedRoutine.getId(), command.exercises());

		return toEditorResponse(savedRoutine);
	}

	@Transactional
	public RoutineEditorResponse updateRoutine(String authToken, Long routineId, RoutineSaveCommand command) {
		Long userId = this.authTokenService.parseUserId(authToken);
		Routine routine = this.routineRepository.findByIdAndUserIdAndActiveTrue(routineId, userId)
			.orElseThrow(() -> new IllegalArgumentException("Routine not found"));

		routine.update(command.name().trim(), null);
		Routine savedRoutine = this.routineRepository.save(routine);
		replaceSchedules(savedRoutine.getId(), command.activeDays());
		replaceExercises(savedRoutine.getId(), command.exercises());

		return toEditorResponse(savedRoutine);
	}

	@Transactional
	public void deleteRoutine(String authToken, Long routineId) {
		Long userId = this.authTokenService.parseUserId(authToken);
		Routine routine = this.routineRepository.findByIdAndUserIdAndActiveTrue(routineId, userId)
			.orElseThrow(() -> new IllegalArgumentException("Routine not found"));

		routine.deactivate();
		this.routineRepository.save(routine);
	}

	@Transactional
	public void reorderRoutines(String authToken, List<Long> routineIds) {
		Long userId = this.authTokenService.parseUserId(authToken);
		List<Routine> routines = this.routineRepository.findActiveRoutinesForOverview(userId);
		Map<Long, Routine> routineById = routines.stream()
			.collect(Collectors.toMap(Routine::getId, routine -> routine));
		Set<Long> requestedIds = new LinkedHashSet<>(routineIds);

		if (!routineById.keySet().containsAll(requestedIds)) {
			throw new IllegalArgumentException("Routine not found");
		}

		List<Routine> reorderedRoutines = new ArrayList<>();
		for (Long routineId : requestedIds) {
			reorderedRoutines.add(routineById.get(routineId));
		}
		for (Routine routine : routines) {
			if (!requestedIds.contains(routine.getId())) {
				reorderedRoutines.add(routine);
			}
		}

		int displayOrder = reorderedRoutines.size();
		for (Routine routine : reorderedRoutines) {
			routine.updateDisplayOrder(displayOrder--);
		}
	}

	private int nextDisplayOrder(Long userId) {
		return this.routineRepository.findMaxDisplayOrderByUserId(userId) + 1;
	}

	private RoutineEditorResponse toEditorResponse(Routine routine) {
		List<RoutineExercise> exercises = this.routineExerciseRepository.findByRoutineIdOrderBySortOrderAsc(routine.getId());
		Map<Long, List<RoutineExerciseSet>> setsByExerciseId = loadSetsByExerciseId(exercises);
		List<DayOfWeek> activeDays = this.routineScheduleRepository.findByRoutineId(routine.getId())
			.stream()
			.map(RoutineSchedule::getDayOfWeek)
			.toList();

		return new RoutineEditorResponse(
			routine.getId(),
			routine.getName(),
			activeDays,
			exercises.stream()
				.map(exercise -> new RoutineExerciseResponse(
					exercise.getExerciseName(),
					exercise.getNotes(),
					setsByExerciseId.getOrDefault(exercise.getId(), List.of()).stream()
						.sorted(Comparator.comparingInt(RoutineExerciseSet::getSetOrder))
						.map(set -> new RoutineSetResponse(set.getTargetWeightKg(), set.getTargetRepetitions()))
						.toList()
				))
				.toList()
		);
	}

	private Map<Long, List<RoutineExerciseSet>> loadSetsByExerciseId(List<RoutineExercise> exercises) {
		if (exercises.isEmpty()) {
			return Map.of();
		}

		return this.routineExerciseSetRepository.findByRoutineExerciseIdIn(exercises.stream().map(RoutineExercise::getId).toList())
			.stream()
			.collect(Collectors.groupingBy(RoutineExerciseSet::getRoutineExerciseId));
	}

	private void replaceSchedules(Long routineId, List<DayOfWeek> activeDays) {
		this.routineScheduleRepository.deleteByRoutineId(routineId);
		this.routineScheduleRepository.flush();

		activeDays.stream()
			.distinct()
			.map(day -> RoutineSchedule.create(routineId, day))
			.forEach(this.routineScheduleRepository::save);
	}

	private void replaceExercises(Long routineId, List<RoutineExerciseCommand> exercises) {
		List<Long> previousExerciseIds = this.routineExerciseRepository.findByRoutineIdOrderBySortOrderAsc(routineId)
			.stream()
			.map(RoutineExercise::getId)
			.toList();

		if (!previousExerciseIds.isEmpty()) {
			this.routineExerciseSetRepository.deleteByRoutineExerciseIdIn(previousExerciseIds);
			this.routineExerciseSetRepository.flush();
		}

		this.routineExerciseRepository.deleteByRoutineId(routineId);
		this.routineExerciseRepository.flush();

		for (int exerciseIndex = 0; exerciseIndex < exercises.size(); exerciseIndex++) {
			RoutineExerciseCommand exerciseCommand = exercises.get(exerciseIndex);
			RoutineExercise exercise = this.routineExerciseRepository.save(RoutineExercise.create(
				routineId,
				exerciseCommand.name().trim(),
				exerciseIndex + 1,
				exerciseCommand.group().trim()
			));

			for (int setIndex = 0; setIndex < exerciseCommand.sets().size(); setIndex++) {
				RoutineSetCommand setCommand = exerciseCommand.sets().get(setIndex);
				this.routineExerciseSetRepository.save(RoutineExerciseSet.create(
					exercise.getId(),
					setIndex + 1,
					setCommand.weight(),
					setCommand.reps()
				));
			}
		}
	}

	public record RoutineSaveCommand(
		String name,
		List<DayOfWeek> activeDays,
		List<RoutineExerciseCommand> exercises,
		boolean createNew
	) {
	}

	public record RoutineExerciseCommand(
		String name,
		String group,
		List<RoutineSetCommand> sets
	) {
	}

	public record RoutineSetCommand(
		BigDecimal weight,
		Integer reps
	) {
	}

	public record RoutineEditorResponse(
		Long id,
		String name,
		List<DayOfWeek> activeDays,
		List<RoutineExerciseResponse> exercises
	) {
	}

	public record RoutineExerciseResponse(
		String name,
		String group,
		List<RoutineSetResponse> sets
	) {
	}

	public record RoutineSetResponse(
		BigDecimal weight,
		Integer reps
	) {
	}
}
