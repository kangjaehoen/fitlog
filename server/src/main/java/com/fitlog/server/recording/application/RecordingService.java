package com.fitlog.server.recording.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fitlog.server.auth.application.AuthTokenService;
import com.fitlog.server.body.domain.BodyMetric;
import com.fitlog.server.body.domain.BodyMetricRepository;
import com.fitlog.server.common.support.KoreanDateText;
import com.fitlog.server.goal.domain.Goal;
import com.fitlog.server.goal.domain.GoalRepository;
import com.fitlog.server.meal.domain.MealItem;
import com.fitlog.server.meal.domain.MealItemRepository;
import com.fitlog.server.meal.domain.MealLog;
import com.fitlog.server.meal.domain.MealLogRepository;
import com.fitlog.server.meal.domain.MealType;
import com.fitlog.server.meal.domain.QuantityUnit;
import com.fitlog.server.routine.domain.Routine;
import com.fitlog.server.routine.domain.RoutineExercise;
import com.fitlog.server.routine.domain.RoutineExerciseRepository;
import com.fitlog.server.routine.domain.RoutineExerciseSet;
import com.fitlog.server.routine.domain.RoutineExerciseSetRepository;
import com.fitlog.server.routine.domain.RoutineRepository;
import com.fitlog.server.workout.domain.WorkoutExercise;
import com.fitlog.server.workout.domain.WorkoutExerciseRepository;
import com.fitlog.server.workout.domain.WorkoutIntensity;
import com.fitlog.server.workout.domain.WorkoutSession;
import com.fitlog.server.workout.domain.WorkoutSessionRepository;
import com.fitlog.server.workout.domain.WorkoutSet;
import com.fitlog.server.workout.domain.WorkoutSetRepository;

@Service
public class RecordingService {

	private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
	private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

	private final AuthTokenService authTokenService;
	private final MealLogRepository mealLogRepository;
	private final MealItemRepository mealItemRepository;
	private final WorkoutSessionRepository workoutSessionRepository;
	private final WorkoutExerciseRepository workoutExerciseRepository;
	private final WorkoutSetRepository workoutSetRepository;
	private final BodyMetricRepository bodyMetricRepository;
	private final GoalRepository goalRepository;
	private final RoutineRepository routineRepository;
	private final RoutineExerciseRepository routineExerciseRepository;
	private final RoutineExerciseSetRepository routineExerciseSetRepository;

	public RecordingService(
		AuthTokenService authTokenService,
		MealLogRepository mealLogRepository,
		MealItemRepository mealItemRepository,
		WorkoutSessionRepository workoutSessionRepository,
		WorkoutExerciseRepository workoutExerciseRepository,
		WorkoutSetRepository workoutSetRepository,
		BodyMetricRepository bodyMetricRepository,
		GoalRepository goalRepository,
		RoutineRepository routineRepository,
		RoutineExerciseRepository routineExerciseRepository,
		RoutineExerciseSetRepository routineExerciseSetRepository
	) {
		this.authTokenService = authTokenService;
		this.mealLogRepository = mealLogRepository;
		this.mealItemRepository = mealItemRepository;
		this.workoutSessionRepository = workoutSessionRepository;
		this.workoutExerciseRepository = workoutExerciseRepository;
		this.workoutSetRepository = workoutSetRepository;
		this.bodyMetricRepository = bodyMetricRepository;
		this.goalRepository = goalRepository;
		this.routineRepository = routineRepository;
		this.routineExerciseRepository = routineExerciseRepository;
		this.routineExerciseSetRepository = routineExerciseSetRepository;
	}

	@Transactional(readOnly = true)
	public BodyInfoDraftResponse getBodyInfoDraft(String authToken) {
		Long userId = this.authTokenService.parseUserId(authToken);
		LocalDate today = LocalDate.now(SEOUL);
		Optional<BodyMetric> latest = this.bodyMetricRepository
			.findFirstByUserIdAndMeasuredOnLessThanEqualOrderByMeasuredOnDescIdDesc(userId, today);

		return new BodyInfoDraftResponse(
			KoreanDateText.formatDailyLabel(today),
			"저장하기",
			List.of(
				bodyMetricDraft("weight", "몸무게", "kg", "40", "150", "0.1", latest.map(BodyMetric::getWeightKg), "70", "#4f46e5"),
				bodyMetricDraft("muscle", "골격근량", "kg", "10", "70", "0.1", latest.map(BodyMetric::getSkeletalMuscleKg), "30", "#059669"),
				bodyMetricDraft("fat", "체지방률", "%", "3", "50", "0.1", latest.map(BodyMetric::getBodyFatPercent), "20", "#e11d48")
			)
		);
	}

	@Transactional(readOnly = true)
	public MealLogDataResponse getMealLog(String authToken) {
		Long userId = this.authTokenService.parseUserId(authToken);
		LocalDate today = LocalDate.now(SEOUL);
		List<MealLog> mealLogs = this.mealLogRepository.findByUserIdAndLoggedDate(userId, today);
		Map<Long, MealLog> mealLogById = mealLogs.stream().collect(Collectors.toMap(MealLog::getId, mealLog -> mealLog));
		List<MealItem> mealItems = mealLogs.isEmpty()
			? List.of()
			: this.mealItemRepository.findByMealLogIdIn(mealLogs.stream().map(MealLog::getId).toList());
		Integer calorieGoal = this.goalRepository.findFirstByUserIdAndActiveTrueOrderByIdDesc(userId)
			.map(Goal::getDailyCalorieGoal)
			.orElse(0);

		return new MealLogDataResponse(
			calorieGoal,
			"어떤 음식을 드셨나요?",
			"오늘 식단에 추가",
			"전체 기록 완료하기",
			List.of("아침", "점심", "저녁", "간식"),
			List.of(
				new UnitOptionResponse("serving", "1회분"),
				new UnitOptionResponse("gram", "그램(g)")
			),
			"",
			1,
			0,
			mealItems.stream()
				.map(item -> toMealRecordResponse(item, mealLogById.get(item.getMealLogId())))
				.toList()
		);
	}

	@Transactional(readOnly = true)
	public WorkoutLogDataResponse getWorkoutLog(String authToken) {
		Long userId = this.authTokenService.parseUserId(authToken);
		LocalDate today = LocalDate.now(SEOUL);
		List<RoutineSetDraftResponse> routineTemplate = routineTemplate(userId);
		String exerciseName = routineExerciseName(userId).orElse("");

		return new WorkoutLogDataResponse(
			0,
			"Workout Session",
			"운동 종목 검색",
			"루틴 불러오기",
			"운동 추가 및 리스트 저장",
			"오늘 운동 전체 종료",
			List.of("쉬움", "적당함", "매우 힘듦"),
			exerciseName,
			routineTemplate,
			completedWorkoutExercises(userId, today)
		);
	}

	@Transactional
	public void recordMeal(String authToken, MealRecordCommand command) {
		Long userId = this.authTokenService.parseUserId(authToken);
		LocalDate today = LocalDate.now(SEOUL);
		MealLog mealLog = this.mealLogRepository
			.findByUserIdAndLoggedDateAndMealType(userId, today, command.mealType())
			.orElseGet(() -> this.mealLogRepository.save(MealLog.create(userId, command.mealType(), today)));

		this.mealItemRepository.save(MealItem.create(
			mealLog.getId(),
			command.foodName().trim(),
			command.quantity(),
			command.quantityUnit(),
			command.caloriesKcal(),
			command.carbG(),
			command.proteinG(),
			command.fatG()
		));
	}

	@Transactional
	public void recordWorkout(String authToken, WorkoutRecordCommand command) {
		Long userId = this.authTokenService.parseUserId(authToken);
		WorkoutSession session = this.workoutSessionRepository.save(WorkoutSession.createCompleted(
			userId,
			LocalDate.now(SEOUL),
			command.durationMinutes(),
			command.caloriesBurned(),
			command.intensity()
		));

		for (int exerciseIndex = 0; exerciseIndex < command.exercises().size(); exerciseIndex++) {
			WorkoutExerciseCommand exerciseCommand = command.exercises().get(exerciseIndex);
			WorkoutExercise exercise = this.workoutExerciseRepository.save(WorkoutExercise.create(
				session.getId(),
				exerciseCommand.name().trim(),
				exerciseIndex + 1
			));

			for (int setIndex = 0; setIndex < exerciseCommand.sets().size(); setIndex++) {
				WorkoutSetCommand setCommand = exerciseCommand.sets().get(setIndex);
				this.workoutSetRepository.save(WorkoutSet.create(
					exercise.getId(),
					setIndex + 1,
					setCommand.weightKg(),
					setCommand.repetitions(),
					setCommand.completed()
				));
			}
		}
	}

	@Transactional
	public void recordBodyMetric(String authToken, BodyMetricCommand command) {
		Long userId = this.authTokenService.parseUserId(authToken);
		LocalDate today = LocalDate.now(SEOUL);
		BodyMetric metric = this.bodyMetricRepository.findByUserIdAndMeasuredOn(userId, today)
			.orElseGet(() -> BodyMetric.create(userId, today, null, null, null));

		metric.update(command.weightKg(), command.skeletalMuscleKg(), command.bodyFatPercent());
		this.bodyMetricRepository.save(metric);
	}

	private BodyMetricDraftResponse bodyMetricDraft(
		String key,
		String label,
		String unit,
		String min,
		String max,
		String step,
		Optional<BigDecimal> latestValue,
		String defaultValue,
		String color
	) {
		return new BodyMetricDraftResponse(
			key,
			label,
			unit,
			new BigDecimal(min),
			new BigDecimal(max),
			new BigDecimal(step),
			latestValue.orElseGet(() -> new BigDecimal(defaultValue)),
			color,
			latestValue.isPresent() ? "최근 기록을 기준으로 불러왔어요." : "기록할 값을 입력해주세요."
		);
	}

	private MealRecordResponse toMealRecordResponse(MealItem item, MealLog mealLog) {
		return new MealRecordResponse(
			mealLog == null ? "식사" : mealTypeLabel(mealLog.getMealType()),
			item.getCreatedAt() == null ? "오늘" : item.getCreatedAt().toLocalTime().format(TIME_FORMATTER),
			item.getFoodName(),
			formatQuantity(item.getQuantity(), item.getQuantityUnit()),
			item.getCaloriesKcal() == null ? 0 : item.getCaloriesKcal(),
			false
		);
	}

	private List<RoutineSetDraftResponse> routineTemplate(Long userId) {
		Optional<Routine> routine = this.routineRepository.findFirstByUserIdAndActiveTrueOrderByIdDesc(userId);
		if (routine.isEmpty()) {
			return List.of();
		}

		List<RoutineExercise> exercises = this.routineExerciseRepository.findByRoutineIdOrderBySortOrderAsc(routine.get().getId());
		if (exercises.isEmpty()) {
			return List.of();
		}

		return this.routineExerciseSetRepository.findByRoutineExerciseIdIn(List.of(exercises.get(0).getId()))
			.stream()
			.sorted(Comparator.comparingInt(RoutineExerciseSet::getSetOrder))
			.map(set -> new RoutineSetDraftResponse(
				set.getTargetWeightKg() == null ? BigDecimal.ZERO : set.getTargetWeightKg(),
				set.getTargetRepetitions() == null ? 0 : set.getTargetRepetitions(),
				false
			))
			.toList();
	}

	private Optional<String> routineExerciseName(Long userId) {
		return this.routineRepository.findFirstByUserIdAndActiveTrueOrderByIdDesc(userId)
			.flatMap(routine -> this.routineExerciseRepository.findByRoutineIdOrderBySortOrderAsc(routine.getId())
				.stream()
				.findFirst()
				.map(RoutineExercise::getExerciseName));
	}

	private List<CompletedExerciseResponse> completedWorkoutExercises(Long userId, LocalDate today) {
		List<WorkoutSession> sessions = this.workoutSessionRepository.findByUserIdAndSessionDate(userId, today);
		if (sessions.isEmpty()) {
			return List.of();
		}

		List<WorkoutExercise> exercises = this.workoutExerciseRepository.findBySessionIdIn(sessions.stream().map(WorkoutSession::getId).toList());
		if (exercises.isEmpty()) {
			return List.of();
		}

		Map<Long, WorkoutSession> sessionById = sessions.stream().collect(Collectors.toMap(WorkoutSession::getId, session -> session));
		Map<Long, List<WorkoutExercise>> exercisesBySessionId = exercises.stream()
			.collect(Collectors.groupingBy(WorkoutExercise::getSessionId));
		Map<Long, List<WorkoutSet>> setsByExerciseId = this.workoutSetRepository
			.findByWorkoutExerciseIdIn(exercises.stream().map(WorkoutExercise::getId).toList())
			.stream()
			.collect(Collectors.groupingBy(WorkoutSet::getWorkoutExerciseId));
		List<CompletedExerciseResponse> responses = new ArrayList<>();

		sessions.stream()
			.sorted(Comparator.comparing(WorkoutSession::getStartedAt, Comparator.nullsLast(Comparator.naturalOrder())))
			.forEach(session -> {
				List<WorkoutExercise> sessionExercises = exercisesBySessionId.getOrDefault(session.getId(), List.of())
					.stream()
					.sorted(Comparator.comparingInt(WorkoutExercise::getSortOrder))
					.toList();
				int caloriesPerExercise = sessionExercises.isEmpty()
					? 0
					: Math.round((float) (session.getCaloriesBurned() == null ? 0 : session.getCaloriesBurned()) / sessionExercises.size());

				sessionExercises.forEach(exercise -> {
					List<WorkoutSet> sets = setsByExerciseId.getOrDefault(exercise.getId(), List.of());
					responses.add(new CompletedExerciseResponse(
						exercise.getExerciseName(),
						workoutSummary(sets),
						formatWorkoutTime(sessionById.get(exercise.getSessionId())),
						caloriesPerExercise,
						"strength"
					));
				});
			});

		return responses;
	}

	private static String workoutSummary(List<WorkoutSet> sets) {
		if (sets.isEmpty()) {
			return "세트 기록 없음";
		}

		BigDecimal volume = sets.stream()
			.filter(set -> set.getWeightKg() != null && set.getRepetitions() != null)
			.map(set -> set.getWeightKg().multiply(BigDecimal.valueOf(set.getRepetitions())))
			.reduce(BigDecimal.ZERO, BigDecimal::add);

		return sets.size() + "세트 · 총 " + formatInteger(volume.setScale(0, RoundingMode.HALF_UP).intValue()) + "kg 볼륨";
	}

	private static String formatWorkoutTime(WorkoutSession session) {
		if (session == null || session.getCompletedAt() == null) {
			return "오늘";
		}

		return session.getCompletedAt().toLocalTime().format(TIME_FORMATTER);
	}

	private static String mealTypeLabel(MealType mealType) {
		return switch (mealType) {
			case BREAKFAST -> "아침";
			case LUNCH -> "점심";
			case DINNER -> "저녁";
			case SNACK -> "간식";
		};
	}

	private static String formatQuantity(BigDecimal quantity, QuantityUnit unit) {
		BigDecimal value = quantity == null ? BigDecimal.ZERO : quantity.stripTrailingZeros();
		return switch (unit) {
			case GRAM -> value.toPlainString() + "g";
			case SERVING -> value.toPlainString() + "회분";
		};
	}

	private static String formatInteger(int value) {
		return String.format("%,d", value);
	}

	public record MealRecordCommand(
		MealType mealType,
		String foodName,
		BigDecimal quantity,
		QuantityUnit quantityUnit,
		Integer caloriesKcal,
		BigDecimal carbG,
		BigDecimal proteinG,
		BigDecimal fatG
	) {
	}

	public record WorkoutRecordCommand(
		Integer durationMinutes,
		Integer caloriesBurned,
		WorkoutIntensity intensity,
		List<WorkoutExerciseCommand> exercises
	) {
	}

	public record WorkoutExerciseCommand(
		String name,
		List<WorkoutSetCommand> sets
	) {
	}

	public record WorkoutSetCommand(
		BigDecimal weightKg,
		Integer repetitions,
		boolean completed
	) {
	}

	public record BodyMetricCommand(
		BigDecimal weightKg,
		BigDecimal skeletalMuscleKg,
		BigDecimal bodyFatPercent
	) {
	}

	public record BodyInfoDraftResponse(
		String dateLabel,
		String primaryActionLabel,
		List<BodyMetricDraftResponse> metrics
	) {
	}

	public record BodyMetricDraftResponse(
		String key,
		String label,
		String unit,
		BigDecimal min,
		BigDecimal max,
		BigDecimal step,
		BigDecimal value,
		String color,
		String helper
	) {
	}

	public record MealLogDataResponse(
		Integer goalCalories,
		String searchPlaceholder,
		String primaryActionLabel,
		String finishActionLabel,
		List<String> mealTypes,
		List<UnitOptionResponse> unitOptions,
		String defaultFoodName,
		Integer defaultServingAmount,
		Integer estimatedCaloriesPerServing,
		List<MealRecordResponse> records
	) {
	}

	public record UnitOptionResponse(
		String key,
		String label
	) {
	}

	public record MealRecordResponse(
		String mealType,
		String time,
		String title,
		String amount,
		Integer calories,
		Boolean cheating
	) {
	}

	public record WorkoutLogDataResponse(
		Integer initialDurationSeconds,
		String sessionLabel,
		String searchPlaceholder,
		String routineActionLabel,
		String addActionLabel,
		String finishActionLabel,
		List<String> intensityOptions,
		String exerciseName,
		List<RoutineSetDraftResponse> routineTemplate,
		List<CompletedExerciseResponse> completedExercises
	) {
	}

	public record RoutineSetDraftResponse(
		BigDecimal weight,
		Integer reps,
		Boolean done
	) {
	}

	public record CompletedExerciseResponse(
		String title,
		String summary,
		String time,
		Integer calories,
		String icon
	) {
	}
}
