package com.fitlog.server.recording.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
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
import com.fitlog.server.meal.domain.FoodNutrientRef;
import com.fitlog.server.meal.domain.FoodNutrientRefRepository;
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
	private final FoodNutrientRefRepository foodNutrientRefRepository;
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
		FoodNutrientRefRepository foodNutrientRefRepository,
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
		this.foodNutrientRefRepository = foodNutrientRefRepository;
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
				new UnitOptionResponse("serving", "1인분"),
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
		return getWorkoutLog(authToken, null);
	}

	@Transactional(readOnly = true)
	public WorkoutLogDataResponse getWorkoutLog(String authToken, Long routineId) {
		Long userId = this.authTokenService.parseUserId(authToken);
		LocalDate today = LocalDate.now(SEOUL);
		Optional<Routine> routine = selectedRoutine(userId, routineId);
		List<RoutineExerciseDraftResponse> routineExercises = routineExercises(routine);
		List<RoutineSetDraftResponse> routineTemplate = routineExercises.stream()
			.findFirst()
			.map(RoutineExerciseDraftResponse::sets)
			.orElse(List.of());
		String exerciseName = routineExercises.stream()
			.findFirst()
			.map(RoutineExerciseDraftResponse::name)
			.orElseGet(() -> routine.map(Routine::getName).orElse(""));

		return new WorkoutLogDataResponse(
			routineId == null ? null : routine.map(Routine::getId).orElse(null),
			0,
			"Workout Session",
			"운동 종목 검색",
			"루틴 불러오기",
			"운동 추가 및 리스트 저장",
			"오늘 운동 전체 종료",
			List.of("쉬움", "적당함", "매우 힘듦"),
			exerciseName,
			routineTemplate,
			routineExercises,
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

		String normalizedFoodName = command.foodName().trim();
		String foodCd = command.foodCd() == null ? null : command.foodCd().trim();
		if (foodCd != null && foodCd.isBlank()) {
			foodCd = null;
		}

		Optional<FoodNutrientRef> ref = resolveFoodRef(foodCd, normalizedFoodName);
		Optional<NutrientScaleResult> scaled = ref.flatMap(value -> scaleNutrients(value, command.quantity(), command.quantityUnit()));

		Integer caloriesKcal = scaled.map(NutrientScaleResult::caloriesKcal).orElse(command.caloriesKcal());
		BigDecimal carbG = scaled.map(NutrientScaleResult::carbG).orElse(command.carbG());
		BigDecimal proteinG = scaled.map(NutrientScaleResult::proteinG).orElse(command.proteinG());
		BigDecimal fatG = scaled.map(NutrientScaleResult::fatG).orElse(command.fatG());
		BigDecimal sugarG = scaled.map(NutrientScaleResult::sugarG).orElse(null);
		BigDecimal sodiumMg = scaled.map(NutrientScaleResult::sodiumMg).orElse(null);
		BigDecimal consumedGrams = scaled.map(NutrientScaleResult::consumedGrams).orElse(null);

		this.mealItemRepository.save(MealItem.create(
			mealLog.getId(),
			normalizedFoodName,
			command.quantity(),
			command.quantityUnit(),
			caloriesKcal,
			carbG,
			proteinG,
			fatG,
			ref.map(FoodNutrientRef::getFoodCd).orElse(foodCd),
			consumedGrams,
			sugarG,
			sodiumMg
		));
	}

	@Transactional
	public void recordWorkout(String authToken, WorkoutRecordCommand command) {
		Long userId = this.authTokenService.parseUserId(authToken);
		WorkoutSession session = this.workoutSessionRepository.save(WorkoutSession.createCompleted(
			userId,
			LocalDate.now(SEOUL),
			normalizedDurationMinutes(command.durationMinutes(), command.exercises()),
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

	private static int normalizedDurationMinutes(Integer requestedMinutes, List<WorkoutExerciseCommand> exercises) {
		if (requestedMinutes != null && requestedMinutes > 0) {
			return requestedMinutes;
		}

		int completedSetCount = exercises == null
			? 0
			: exercises.stream()
				.flatMap(exercise -> exercise.sets().stream())
				.filter(WorkoutSetCommand::completed)
				.mapToInt(set -> 1)
				.sum();

		return completedSetCount > 0 ? completedSetCount : 0;
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

	private Optional<Routine> selectedRoutine(Long userId, Long routineId) {
		if (routineId != null) {
			return this.routineRepository.findByIdAndUserIdAndActiveTrue(routineId, userId);
		}

		return this.routineRepository.findFirstByUserIdAndActiveTrueOrderByIdDesc(userId);
	}

	private List<RoutineExerciseDraftResponse> routineExercises(Optional<Routine> routine) {
		if (routine.isEmpty()) {
			return List.of();
		}

		List<RoutineExercise> exercises = this.routineExerciseRepository.findByRoutineIdOrderBySortOrderAsc(routine.get().getId());
		if (exercises.isEmpty()) {
			return List.of();
		}

		Map<Long, List<RoutineExerciseSet>> setsByExerciseId = this.routineExerciseSetRepository
			.findByRoutineExerciseIdIn(exercises.stream().map(RoutineExercise::getId).toList())
			.stream()
			.collect(Collectors.groupingBy(RoutineExerciseSet::getRoutineExerciseId));

		return exercises.stream()
			.map(exercise -> new RoutineExerciseDraftResponse(
				routineExerciseName(routine.get(), exercise),
				setsByExerciseId.getOrDefault(exercise.getId(), List.of()).stream()
					.sorted(Comparator.comparingInt(RoutineExerciseSet::getSetOrder))
					.map(set -> new RoutineSetDraftResponse(
						set.getTargetWeightKg() == null ? BigDecimal.ZERO : set.getTargetWeightKg(),
						set.getTargetRepetitions() == null ? 0 : set.getTargetRepetitions(),
						false
					))
					.toList()
			))
			.toList();
	}

	private String routineExerciseName(Routine routine, RoutineExercise exercise) {
		String exerciseName = exercise.getExerciseName();
		if (exerciseName == null || exerciseName.isBlank() || exerciseName.equals("새 운동")) {
			return routine.getName();
		}

		return exerciseName;
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
			case SERVING -> value.toPlainString() + "인분";
		};
	}

	private static String formatInteger(int value) {
		return String.format("%,d", value);
	}

	private Optional<FoodNutrientRef> resolveFoodRef(String foodCd, String normalizedFoodName) {
		if (foodCd != null && !foodCd.isBlank()) {
			return this.foodNutrientRefRepository.findById(foodCd);
		}
		// foodCd가 없는 기록도 영양 계산을 할 수 있도록 "정확한 단일 매칭"만 허용
		String normalized = normalizeFoodName(normalizedFoodName);
		if (normalized.isBlank()) {
			return Optional.empty();
		}

		List<FoodNutrientRef> candidates = this.foodNutrientRefRepository.searchByName(normalized);
		List<FoodNutrientRef> exactMatches = candidates.stream()
			.filter(c -> normalized.equals(normalizeFoodName(c.getFoodNameKr())))
			.toList();
		if (exactMatches.size() != 1) {
			return Optional.empty();
		}
		return Optional.of(exactMatches.get(0));
	}

	private static String normalizeFoodName(String value) {
		if (value == null) {
			return "";
		}
		return value.trim().replace(" ", "").toLowerCase(Locale.ROOT);
	}

	public record MealRecordCommand(
		MealType mealType,
		String foodName,
		String foodCd,
		BigDecimal quantity,
		QuantityUnit quantityUnit,
		Integer caloriesKcal,
		BigDecimal carbG,
		BigDecimal proteinG,
		BigDecimal fatG
	) {
	}

	private static Optional<NutrientScaleResult> scaleNutrients(FoodNutrientRef ref, BigDecimal quantity, QuantityUnit quantityUnit) {
		if (ref == null || quantity == null || quantityUnit == null) {
			return Optional.empty();
		}
		if (quantity.signum() <= 0) {
			return Optional.empty();
		}

		BigDecimal baselineG = ref.getNutrientBaselineG();
		BigDecimal factor;
		BigDecimal consumedGrams;

		switch (quantityUnit) {
			case SERVING -> {
				// 기준 g가 없어도 "1회분" 기준 영양성분으로 계산 가능
				factor = quantity;
				consumedGrams = (baselineG != null && baselineG.signum() > 0)
					? quantity.multiply(baselineG).setScale(4, RoundingMode.HALF_UP)
					: null;
			}
			case GRAM -> {
				// 기준 g가 없으면 100g 기준으로라도 계산 (consumedGrams는 입력값 그대로)
				BigDecimal effectiveBaseline = (baselineG != null && baselineG.signum() > 0)
					? baselineG
					: BigDecimal.valueOf(100);
				factor = quantity.divide(effectiveBaseline, 12, RoundingMode.HALF_UP);
				consumedGrams = quantity.setScale(4, RoundingMode.HALF_UP);
			}
			default -> {
				return Optional.empty();
			}
		}

		Integer caloriesKcal = scaleToInteger(ref.getEnergyKcal(), factor);

		return Optional.of(new NutrientScaleResult(
			consumedGrams,
			caloriesKcal,
			scaleTo2(ref.getCarbG(), factor),
			scaleTo2(ref.getProteinG(), factor),
			scaleTo2(ref.getFatG(), factor),
			scaleTo2(ref.getSugarG(), factor),
			scaleTo2(ref.getSodiumMg(), factor)
		));
	}

	private static BigDecimal scaleTo2(BigDecimal baseline, BigDecimal factor) {
		if (baseline == null || factor == null) {
			return null;
		}
		return baseline.multiply(factor).setScale(2, RoundingMode.HALF_UP);
	}

	private static Integer scaleToInteger(BigDecimal baseline, BigDecimal factor) {
		if (baseline == null || factor == null) {
			return null;
		}
		return baseline.multiply(factor).setScale(0, RoundingMode.HALF_UP).intValue();
	}

	private record NutrientScaleResult(
		BigDecimal consumedGrams,
		Integer caloriesKcal,
		BigDecimal carbG,
		BigDecimal proteinG,
		BigDecimal fatG,
		BigDecimal sugarG,
		BigDecimal sodiumMg
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
		Long routineId,
		Integer initialDurationSeconds,
		String sessionLabel,
		String searchPlaceholder,
		String routineActionLabel,
		String addActionLabel,
		String finishActionLabel,
		List<String> intensityOptions,
		String exerciseName,
		List<RoutineSetDraftResponse> routineTemplate,
		List<RoutineExerciseDraftResponse> routineExercises,
		List<CompletedExerciseResponse> completedExercises
	) {
	}

	public record RoutineExerciseDraftResponse(
		String name,
		List<RoutineSetDraftResponse> sets
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
