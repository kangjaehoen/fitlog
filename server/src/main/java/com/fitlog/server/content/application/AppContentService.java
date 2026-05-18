package com.fitlog.server.content.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;

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
import com.fitlog.server.routine.domain.Routine;
import com.fitlog.server.routine.domain.RoutineExerciseRepository;
import com.fitlog.server.routine.domain.RoutineRepository;
import com.fitlog.server.routine.domain.RoutineScheduleRepository;
import com.fitlog.server.user.domain.User;
import com.fitlog.server.user.domain.UserProfile;
import com.fitlog.server.user.domain.UserProfileRepository;
import com.fitlog.server.user.domain.UserRepository;
import com.fitlog.server.workout.domain.WorkoutExercise;
import com.fitlog.server.workout.domain.WorkoutExerciseRepository;
import com.fitlog.server.workout.domain.WorkoutSession;
import com.fitlog.server.workout.domain.WorkoutSessionRepository;
import com.fitlog.server.workout.domain.WorkoutSet;
import com.fitlog.server.workout.domain.WorkoutSetRepository;
import com.fitlog.server.workout.domain.WorkoutStatus;

@Service
public class AppContentService {

	private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
	private static final int STREAK_LOOKBACK_DAYS = 60;
	private static final DateTimeFormatter CHART_DATE_FORMATTER = DateTimeFormatter.ofPattern("MM.dd");

	private final AuthTokenService authTokenService;
	private final MealLogRepository mealLogRepository;
	private final MealItemRepository mealItemRepository;
	private final GoalRepository goalRepository;
	private final BodyMetricRepository bodyMetricRepository;
	private final WorkoutSessionRepository workoutSessionRepository;
	private final WorkoutExerciseRepository workoutExerciseRepository;
	private final WorkoutSetRepository workoutSetRepository;
	private final RoutineRepository routineRepository;
	private final RoutineExerciseRepository routineExerciseRepository;
	private final RoutineScheduleRepository routineScheduleRepository;
	private final UserRepository userRepository;
	private final UserProfileRepository userProfileRepository;

	public AppContentService(
		AuthTokenService authTokenService,
		MealLogRepository mealLogRepository,
		MealItemRepository mealItemRepository,
		GoalRepository goalRepository,
		BodyMetricRepository bodyMetricRepository,
		WorkoutSessionRepository workoutSessionRepository,
		WorkoutExerciseRepository workoutExerciseRepository,
		WorkoutSetRepository workoutSetRepository,
		RoutineRepository routineRepository,
		RoutineExerciseRepository routineExerciseRepository,
		RoutineScheduleRepository routineScheduleRepository,
		UserRepository userRepository,
		UserProfileRepository userProfileRepository
	) {
		this.authTokenService = authTokenService;
		this.mealLogRepository = mealLogRepository;
		this.mealItemRepository = mealItemRepository;
		this.goalRepository = goalRepository;
		this.bodyMetricRepository = bodyMetricRepository;
		this.workoutSessionRepository = workoutSessionRepository;
		this.workoutExerciseRepository = workoutExerciseRepository;
		this.workoutSetRepository = workoutSetRepository;
		this.routineRepository = routineRepository;
		this.routineExerciseRepository = routineExerciseRepository;
		this.routineScheduleRepository = routineScheduleRepository;
		this.userRepository = userRepository;
		this.userProfileRepository = userProfileRepository;
	}

	@Transactional(readOnly = true)
	public HomeDashboardResponse getHomeDashboard(String authToken) {
		Long userId = this.authTokenService.parseUserId(authToken);
		LocalDate today = LocalDate.now(SEOUL);
		LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
		List<MealLog> todayMealLogs = this.mealLogRepository.findByUserIdAndLoggedDate(userId, today);
		List<WorkoutSession> todayWorkoutSessions = this.workoutSessionRepository.findByUserIdAndSessionDate(userId, today);
		NutritionTotals todayNutrition = loadNutrition(todayMealLogs);
		GoalTargets targets = this.goalRepository.findFirstByUserIdAndActiveTrueOrderByIdDesc(userId)
			.map(GoalTargets::from)
			.orElseGet(GoalTargets::defaults);
		Optional<BodyMetric> latestBodyMetric = this.bodyMetricRepository
			.findFirstByUserIdAndMeasuredOnLessThanEqualOrderByMeasuredOnDescIdDesc(userId, today);

		// 목표 탄/단/지가 없으면 그래프가 항상 0%로 보이므로, "표시용"으로만 칼로리 목표 기반 추정치를 사용
		GoalTargets displayTargets = targets.withDerivedMacroGoals();

		int caloriePercent = percent(todayNutrition.calories(), displayTargets.dailyCalorieGoal());
		int carbPercent = percent(todayNutrition.carbG(), displayTargets.dailyCarbGoalG());
		int proteinPercent = percent(todayNutrition.proteinG(), displayTargets.dailyProteinGoalG());
		int fatPercent = percent(todayNutrition.fatG(), displayTargets.dailyFatGoalG());
		int goalPercent = averageGoalPercent(displayTargets, caloriePercent, carbPercent, proteinPercent, fatPercent);

		return new HomeDashboardResponse(
			"\uC624\uB298 \uAE30\uB85D",
			KoreanDateText.formatDailyLabel(today),
			List.of(
				"\uC2DD\uB2E8 " + todayMealLogs.size() + "\uD68C",
				workoutChip(todayWorkoutSessions),
				"\uC218\uBD84 \uAE30\uB85D \uC5C6\uC74C"
			),
			goalPercent,
			"\uBAA9\uD45C " + goalPercent + "% \uB2EC\uC131",
			List.of(
				new SummaryCardResponse("\uCE7C\uB85C\uB9AC", formatInteger(todayNutrition.calories()), formatIntegerTarget(displayTargets.dailyCalorieGoal(), "kcal"), null),
				new SummaryCardResponse("\uB2E8\uBC31\uC9C8", formatWholeNumber(todayNutrition.proteinG()), formatDecimalTarget(displayTargets.dailyProteinGoalG(), "g"), null),
				new SummaryCardResponse("\uC6B4\uB3D9", workoutSummaryValue(todayWorkoutSessions), null, workoutSummaryStatus(todayWorkoutSessions)),
				new SummaryCardResponse("\uCCB4\uC911", latestBodyMetric.map(BodyMetric::getWeightKg).map(AppContentService::formatDecimal).orElse("-"), "kg", null)
			),
			List.of(
				new NutritionProgressResponse("\uCE7C\uB85C\uB9AC", caloriePercent, "bg-[#f6bcc8]"),
				new NutritionProgressResponse("\uD0C4\uC218\uD654\uBB3C", carbPercent, "bg-[#b1a6fb]"),
				new NutritionProgressResponse("\uB2E8\uBC31\uC9C8", proteinPercent, "bg-[#8fd5ad]"),
				new NutritionProgressResponse("\uC9C0\uBC29", fatPercent, "bg-[#95d9e4]")
			),
			buildWorkout(userId, today),
			buildWeeklySummary(userId, today, weekStart)
		);
	}

	@Transactional(readOnly = true)
	public ProfileScreenResponse getProfileScreen(String authToken) {
		Long userId = this.authTokenService.parseUserId(authToken);
		LocalDate today = LocalDate.now(SEOUL);
		LocalDate monthStart = today.withDayOfMonth(1);
		LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
		LocalDate weekEnd = weekStart.plusDays(6);
		User user = this.userRepository.findById(userId)
			.orElseThrow(() -> new IllegalArgumentException("User not found"));
		Optional<UserProfile> profile = this.userProfileRepository.findByUserId(userId);
		String displayName = profile.map(UserProfile::getNickname).orElse(user.getEmail());
		String profileImageUrl = profile.map(UserProfile::getProfileImageUrl).orElse(null);
		List<WorkoutSession> monthlySessions = completedSessions(
			this.workoutSessionRepository.findByUserIdAndSessionDateBetween(userId, monthStart, today)
		);
		List<WorkoutSession> weeklySessions = completedSessions(
			this.workoutSessionRepository.findByUserIdAndSessionDateBetween(userId, weekStart, weekEnd)
		);
		int totalMinutes = totalWorkoutMinutes(monthlySessions);
		BigDecimal monthlyVolumeKg = workoutVolume(monthlySessions);
		Optional<Goal> activeGoal = this.goalRepository.findFirstByUserIdAndActiveTrueOrderByIdDesc(userId);
		int weeklyWorkoutGoal = activeGoal.map(Goal::getWeeklyWorkoutGoal).orElse(0);
		int goalPercent = weeklyWorkoutGoal <= 0
			? 0
			: clamp(Math.round((float) weeklySessions.size() * 100 / weeklyWorkoutGoal));

		return new ProfileScreenResponse(
			displayName,
			profileImageUrl,
			startedDaysAgo(user, today),
			"",
			recordStreak(userId, today) + "일 연속",
			List.of(
				new ProfileSummaryStatResponse("이번 달 운동", monthlySessions.size() + "회"),
				new ProfileSummaryStatResponse("총 운동 시간", formatHourSummary(totalMinutes)),
				new ProfileSummaryStatResponse("누적 볼륨", formatVolumeTon(monthlyVolumeKg))
			),
			new ProfileGoalResponse(
				goalPercent + "% 달성",
				goalPercent,
				weeklyWorkoutGoal <= 0
					? "설정된 주간 운동 목표가 없습니다."
					: "이번 주 목표 " + weeklyWorkoutGoal + "회 중 " + weeklySessions.size() + "회를 완료했습니다."
			),
			buildProfileMetrics(userId),
			List.of(
				new ProfileShortcutResponse("신체 데이터 기록", "몸무게, 골격근량, 체지방률을 바로 남기기", "/body-info"),
				new ProfileShortcutResponse("루틴 편집", "이번 주 루틴을 세트 단위로 조정하기", "/routine-edit"),
				new ProfileShortcutResponse("설정", "알림과 계정 관련 옵션 관리", "/setting")
			)
		);
	}

	@Transactional
	public ProfileScreenResponse updateProfileNickname(String authToken, String nickname) {
		Long userId = this.authTokenService.parseUserId(authToken);
		User user = this.userRepository.findById(userId)
			.orElseThrow(() -> new IllegalArgumentException("User not found"));
		UserProfile profile = this.userProfileRepository.findByUserId(userId)
			.orElseGet(() -> this.userProfileRepository.save(UserProfile.create(userId, user.getEmail())));

		profile.updateNickname(nickname);

		return getProfileScreen(authToken);
	}

	private WorkoutResponse buildWorkout(Long userId, LocalDate today) {
		Optional<WorkoutSession> session = this.workoutSessionRepository.findFirstByUserIdAndSessionDateOrderByStartedAtDescIdDesc(userId, today);
		if (session.isEmpty()) {
			return new WorkoutResponse(
				"\uC624\uB298 \uC6B4\uB3D9",
				"\uC624\uB298\uC758 \uB8E8\uD2F4: \uAE30\uB85D \uC5C6\uC74C",
				"0/0 \uC644\uB8CC",
				"0\uBD84",
				"0 kcal",
				"\uC624\uB298 \uC6B4\uB3D9 \uC2DC\uC791\uD558\uAE30"
			);
		}

		WorkoutSession workoutSession = session.get();
		List<WorkoutExercise> exercises = this.workoutExerciseRepository.findBySessionId(workoutSession.getId());
		List<WorkoutSet> sets = loadWorkoutSets(exercises);
		int total = workoutTotalCount(workoutSession, exercises, sets);
		int completed = workoutCompletedCount(workoutSession, sets, total);

		return new WorkoutResponse(
			"\uC624\uB298 \uC6B4\uB3D9",
			"\uC624\uB298\uC758 \uB8E8\uD2F4: " + routineName(workoutSession),
			workoutProgressLabel(workoutSession, completed, total),
			formatDuration(workoutSession.getDurationMinutes()),
			formatCalories(workoutSession.getCaloriesBurned()),
			workoutActionLabel(workoutSession)
		);
	}

	private List<WeeklySummaryItemResponse> buildWeeklySummary(Long userId, LocalDate today, LocalDate weekStart) {
		LocalDate weekEnd = weekStart.plusDays(6);
		List<WorkoutSession> weeklyWorkoutSessions = this.workoutSessionRepository.findByUserIdAndSessionDateBetween(userId, weekStart, weekEnd);
		List<MealLog> weeklyMealLogs = this.mealLogRepository.findByUserIdAndLoggedDateBetween(userId, weekStart, weekEnd);
		NutritionTotals weeklyNutrition = loadNutrition(weeklyMealLogs);
		long mealLogDays = weeklyMealLogs.stream().map(MealLog::getLoggedDate).distinct().count();
		long completedWorkouts = weeklyWorkoutSessions.stream()
			.filter(session -> session.getStatus() == WorkoutStatus.COMPLETED)
			.count();

		return List.of(
			new WeeklySummaryItemResponse("\uC6B4\uB3D9", completedWorkouts + "\uD68C", "\uC774\uBC88 \uC8FC \uC644\uB8CC\uD55C \uC6B4\uB3D9", "text-slate-900"),
			new WeeklySummaryItemResponse("\uD3C9\uADE0 \uCE7C\uB85C\uB9AC", formatInteger(averageCalories(weeklyNutrition.calories(), mealLogDays)) + " kcal", "\uAE30\uB85D\uB41C \uB0A0 \uAE30\uC900", "text-orange-500"),
			new WeeklySummaryItemResponse("\uCCB4\uC911 \uBCC0\uD654", weightChange(userId, today, weekStart), "\uC774\uBC88 \uC8FC \uC2DC\uC791 \uC804 \uB300\uBE44", "text-indigo-600"),
			new WeeklySummaryItemResponse("\uC5F0\uC18D \uAE30\uB85D", recordStreak(userId, today) + "\uC77C", "\uCD5C\uADFC \uC5F0\uC18D \uAE30\uB85D\uC77C", "text-emerald-600")
		);
	}

	private NutritionTotals loadNutrition(List<MealLog> mealLogs) {
		if (mealLogs.isEmpty()) {
			return NutritionTotals.empty();
		}

		List<Long> mealLogIds = mealLogs.stream().map(MealLog::getId).toList();
		List<MealItem> items = this.mealItemRepository.findByMealLogIdIn(mealLogIds);
		int calories = items.stream()
			.map(MealItem::getCaloriesKcal)
			.filter(value -> value != null)
			.mapToInt(Integer::intValue)
			.sum();
		BigDecimal carbG = sum(items.stream().map(MealItem::getCarbG).toList());
		BigDecimal proteinG = sum(items.stream().map(MealItem::getProteinG).toList());
		BigDecimal fatG = sum(items.stream().map(MealItem::getFatG).toList());

		return new NutritionTotals(calories, carbG, proteinG, fatG);
	}

	private List<WorkoutSet> loadWorkoutSets(List<WorkoutExercise> exercises) {
		if (exercises.isEmpty()) {
			return List.of();
		}

		return this.workoutSetRepository.findByWorkoutExerciseIdIn(exercises.stream().map(WorkoutExercise::getId).toList());
	}

	private int workoutTotalCount(WorkoutSession session, List<WorkoutExercise> exercises, List<WorkoutSet> sets) {
		if (!sets.isEmpty()) {
			return sets.size();
		}

		if (!exercises.isEmpty()) {
			return exercises.size();
		}

		if (session.getRoutineId() != null) {
			return Math.toIntExact(this.routineExerciseRepository.countByRoutineId(session.getRoutineId()));
		}

		return 0;
	}

	private static int workoutCompletedCount(WorkoutSession session, List<WorkoutSet> sets, int total) {
		if (!sets.isEmpty()) {
			return Math.toIntExact(sets.stream().filter(WorkoutSet::isCompleted).count());
		}

		return session.getStatus() == WorkoutStatus.COMPLETED ? total : 0;
	}

	private String routineName(WorkoutSession session) {
		if (session.getRoutineId() == null) {
			return "\uC9C1\uC811 \uAE30\uB85D";
		}

		return this.routineRepository.findById(session.getRoutineId())
			.map(Routine::getName)
			.orElse("\uC0AD\uC81C\uB41C \uB8E8\uD2F4");
	}

	private static String workoutProgressLabel(WorkoutSession session, int completed, int total) {
		if (total > 0) {
			return completed + "/" + total + " \uC644\uB8CC";
		}

		return switch (session.getStatus()) {
			case COMPLETED -> "\uC644\uB8CC";
			case IN_PROGRESS -> "\uC9C4\uD589 \uC911";
			case CANCELLED -> "\uCDE8\uC18C";
		};
	}

	private static String workoutActionLabel(WorkoutSession session) {
		return switch (session.getStatus()) {
			case COMPLETED -> "\uC624\uB298 \uC6B4\uB3D9 \uAE30\uB85D \uBCF4\uAE30";
			case IN_PROGRESS -> "\uC774\uC5B4\uC11C \uC6B4\uB3D9 \uAE30\uB85D\uD558\uAE30";
			case CANCELLED -> "\uC624\uB298 \uC6B4\uB3D9 \uC2DC\uC791\uD558\uAE30";
		};
	}

	private static String workoutChip(List<WorkoutSession> sessions) {
		if (sessions.stream().anyMatch(session -> session.getStatus() == WorkoutStatus.COMPLETED)) {
			return "\uC6B4\uB3D9 \uC644\uB8CC";
		}

		if (!sessions.isEmpty()) {
			return "\uC6B4\uB3D9 \uC9C4\uD589 \uC911";
		}

		return "\uC6B4\uB3D9 \uBBF8\uAE30\uB85D";
	}

	private static String workoutSummaryValue(List<WorkoutSession> sessions) {
		if (sessions.stream().anyMatch(session -> session.getStatus() == WorkoutStatus.COMPLETED)) {
			return "\uC644\uB8CC";
		}

		if (!sessions.isEmpty()) {
			return "\uC9C4\uD589 \uC911";
		}

		return "\uBBF8\uAE30\uB85D";
	}

	private static String workoutSummaryStatus(List<WorkoutSession> sessions) {
		return sessions.stream().anyMatch(session -> session.getStatus() == WorkoutStatus.COMPLETED)
			? "\uC624\uB298 \uC6B4\uB3D9 \uAE30\uB85D \uC644\uB8CC"
			: null;
	}

	private String weightChange(Long userId, LocalDate today, LocalDate weekStart) {
		Optional<BodyMetric> latest = this.bodyMetricRepository.findFirstByUserIdAndMeasuredOnLessThanEqualOrderByMeasuredOnDescIdDesc(userId, today);
		Optional<BodyMetric> previous = this.bodyMetricRepository.findFirstByUserIdAndMeasuredOnBeforeOrderByMeasuredOnDescIdDesc(userId, weekStart);
		if (latest.isEmpty() || previous.isEmpty() || latest.get().getWeightKg() == null || previous.get().getWeightKg() == null) {
			return "0kg";
		}

		BigDecimal change = latest.get().getWeightKg().subtract(previous.get().getWeightKg());
		String sign = change.signum() > 0 ? "+" : "";
		return sign + formatDecimal(change) + "kg";
	}

	private int recordStreak(Long userId, LocalDate today) {
		LocalDate startDate = today.minusDays(STREAK_LOOKBACK_DAYS);
		Set<LocalDate> recordedDates = new HashSet<>();
		recordedDates.addAll(this.mealLogRepository.findLoggedDatesByUserIdBetween(userId, startDate, today));
		recordedDates.addAll(this.workoutSessionRepository.findRecordedDatesByUserIdBetween(userId, startDate, today));
		recordedDates.addAll(this.bodyMetricRepository.findRecordedDatesByUserIdBetween(userId, startDate, today));

		int streak = 0;
		for (LocalDate date = today; !date.isBefore(startDate); date = date.minusDays(1)) {
			if (!recordedDates.contains(date)) {
				break;
			}
			streak++;
		}

		return streak;
	}

	private int startedDaysAgo(User user, LocalDate today) {
		if (user.getCreatedAt() == null) {
			return 0;
		}

		return Math.toIntExact(ChronoUnit.DAYS.between(user.getCreatedAt().toLocalDate(), today)) + 1;
	}

	private BigDecimal workoutVolume(List<WorkoutSession> sessions) {
		if (sessions.isEmpty()) {
			return BigDecimal.ZERO;
		}

		List<Long> sessionIds = sessions.stream().map(WorkoutSession::getId).toList();
		List<WorkoutExercise> exercises = this.workoutExerciseRepository.findBySessionIdIn(sessionIds);
		if (exercises.isEmpty()) {
			return BigDecimal.ZERO;
		}

		return this.workoutSetRepository.findByWorkoutExerciseIdIn(exercises.stream().map(WorkoutExercise::getId).toList())
			.stream()
			.filter(WorkoutSet::isCompleted)
			.filter(set -> set.getWeightKg() != null && set.getRepetitions() != null)
			.map(set -> set.getWeightKg().multiply(BigDecimal.valueOf(set.getRepetitions())))
			.reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	private List<ProfileMetricResponse> buildProfileMetrics(Long userId) {
		List<BodyMetric> metrics = new ArrayList<>(this.bodyMetricRepository.findTop5ByUserIdOrderByMeasuredOnDescIdDesc(userId));
		Collections.reverse(metrics);

		return List.of(
			profileMetric("weight", "몸무게", "kg", "#4f46e5", metrics, BodyMetric::getWeightKg),
			profileMetric("muscle", "골격근량", "kg", "#059669", metrics, BodyMetric::getSkeletalMuscleKg),
			profileMetric("fat", "체지방률", "%", "#e11d48", metrics, BodyMetric::getBodyFatPercent)
		);
	}

	private ProfileMetricResponse profileMetric(
		String key,
		String label,
		String unit,
		String color,
		List<BodyMetric> metrics,
		Function<BodyMetric, BigDecimal> valueExtractor
	) {
		List<BodyMetric> valueMetrics = metrics.stream()
			.filter(metric -> valueExtractor.apply(metric) != null)
			.toList();
		List<BigDecimal> values = valueMetrics.stream()
			.map(valueExtractor)
			.toList();
		if (values.isEmpty()) {
			return new ProfileMetricResponse(key, label, "-", unit, "0", "down", color, List.of(BigDecimal.ZERO), List.of("오늘"));
		}

		BigDecimal currentValue = values.get(values.size() - 1);
		BigDecimal previousValue = values.size() > 1 ? values.get(values.size() - 2) : currentValue;
		BigDecimal delta = currentValue.subtract(previousValue);
		List<String> dateLabels = valueMetrics.stream()
			.map(BodyMetric::getMeasuredOn)
			.map(CHART_DATE_FORMATTER::format)
			.toList();

		return new ProfileMetricResponse(
			key,
			label,
			formatDecimal(currentValue),
			unit,
			formatSignedDecimal(delta),
			delta.signum() >= 0 ? "up" : "down",
			color,
			values,
			dateLabels
		);
	}

	private static int averageCalories(int calories, long mealLogDays) {
		if (mealLogDays <= 0) {
			return 0;
		}

		return Math.round((float) calories / mealLogDays);
	}

	private static BigDecimal sum(List<BigDecimal> values) {
		return values.stream()
			.filter(value -> value != null)
			.reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	private static int percent(int value, Integer target) {
		if (target == null || target <= 0) {
			return 0;
		}

		return clamp(Math.round((float) value * 100 / target));
	}

	private static int percent(BigDecimal value, BigDecimal target) {
		if (target == null || target.signum() <= 0) {
			return 0;
		}

		return clamp(value.multiply(BigDecimal.valueOf(100)).divide(target, 0, RoundingMode.HALF_UP).intValue());
	}

	private static int averageGoalPercent(GoalTargets targets, int caloriePercent, int carbPercent, int proteinPercent, int fatPercent) {
		int sum = 0;
		int count = 0;
		if (targets.dailyCalorieGoal() != null && targets.dailyCalorieGoal() > 0) {
			sum += caloriePercent;
			count++;
		}
		if (targets.dailyCarbGoalG() != null && targets.dailyCarbGoalG().signum() > 0) {
			sum += carbPercent;
			count++;
		}
		if (targets.dailyProteinGoalG() != null && targets.dailyProteinGoalG().signum() > 0) {
			sum += proteinPercent;
			count++;
		}
		if (targets.dailyFatGoalG() != null && targets.dailyFatGoalG().signum() > 0) {
			sum += fatPercent;
			count++;
		}

		return count == 0 ? 0 : Math.round((float) sum / count);
	}

	private static int clamp(int value) {
		return Math.max(0, Math.min(100, value));
	}

	private static String formatInteger(int value) {
		return String.format("%,d", value);
	}

	private static String formatIntegerTarget(Integer value, String unit) {
		if (value == null || value <= 0) {
			return "/ \uBAA9\uD45C \uC5C6\uC74C";
		}

		return "/ " + formatInteger(value) + " " + unit;
	}

	private static String formatDecimalTarget(BigDecimal value, String unit) {
		if (value == null || value.signum() <= 0) {
			return "/ \uBAA9\uD45C \uC5C6\uC74C";
		}

		return "/ " + formatWholeNumber(value) + unit;
	}

	private static String formatWholeNumber(BigDecimal value) {
		return formatInteger(value.setScale(0, RoundingMode.HALF_UP).intValue());
	}

	private static String formatDecimal(BigDecimal value) {
		return value.setScale(1, RoundingMode.HALF_UP).stripTrailingZeros().toPlainString();
	}

	private static String formatSignedDecimal(BigDecimal value) {
		String sign = value.signum() > 0 ? "+" : "";
		return sign + formatDecimal(value);
	}

	private static String formatHourSummary(int minutes) {
		if (minutes <= 0) {
			return "0h";
		}

		BigDecimal hours = BigDecimal.valueOf(minutes)
			.divide(BigDecimal.valueOf(60), 1, RoundingMode.HALF_UP);
		return formatDecimal(hours) + "h";
	}

	private static String formatVolumeTon(BigDecimal volumeKg) {
		if (volumeKg.signum() <= 0) {
			return "0t";
		}

		return formatDecimal(volumeKg.divide(BigDecimal.valueOf(1000), 1, RoundingMode.HALF_UP)) + "t";
	}

	private static String formatDuration(Integer minutes) {
		return (minutes == null ? 0 : minutes) + "\uBD84";
	}

	private static String formatCalories(Integer calories) {
		return formatInteger(calories == null ? 0 : calories) + " kcal";
	}

	private record NutritionTotals(
		int calories,
		BigDecimal carbG,
		BigDecimal proteinG,
		BigDecimal fatG
	) {

		private static NutritionTotals empty() {
			return new NutritionTotals(0, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
		}
	}

	private record GoalTargets(
		Integer dailyCalorieGoal,
		BigDecimal dailyCarbGoalG,
		BigDecimal dailyProteinGoalG,
		BigDecimal dailyFatGoalG
	) {

		private static GoalTargets from(Goal goal) {
			return new GoalTargets(
				goal.getDailyCalorieGoal(),
				goal.getDailyCarbGoalG(),
				goal.getDailyProteinGoalG(),
				goal.getDailyFatGoalG()
			);
		}

		private GoalTargets withDerivedMacroGoals() {
			Integer calories = this.dailyCalorieGoal;
			if (calories == null || calories <= 0) {
				return this;
			}

			BigDecimal derivedCarbG = deriveCarbGoalG(calories);
			BigDecimal derivedProteinG = deriveProteinGoalG(calories);
			BigDecimal derivedFatG = deriveFatGoalG(calories);

			return new GoalTargets(
				this.dailyCalorieGoal,
				isMissingOrZero(this.dailyCarbGoalG) ? derivedCarbG : this.dailyCarbGoalG,
				isMissingOrZero(this.dailyProteinGoalG) ? derivedProteinG : this.dailyProteinGoalG,
				isMissingOrZero(this.dailyFatGoalG) ? derivedFatG : this.dailyFatGoalG
			);
		}

		private static GoalTargets empty() {
			return new GoalTargets(null, null, null, null);
		}

		private static GoalTargets defaults() {
			return new GoalTargets(
				2300,
				new BigDecimal("280.00"),
				new BigDecimal("160.00"),
				new BigDecimal("70.00")
			);
		}

		private static boolean isMissingOrZero(BigDecimal value) {
			return value == null || value.signum() <= 0;
		}

		/**
		 * 기본 매크로 비율(칼로리 기준): 탄 50% / 단 25% / 지 25%
		 * - 탄/단: 4kcal per g
		 * - 지: 9kcal per g
		 */
		private static BigDecimal deriveCarbGoalG(int dailyCalorieGoal) {
			return BigDecimal.valueOf(dailyCalorieGoal)
				.multiply(BigDecimal.valueOf(0.50))
				.divide(BigDecimal.valueOf(4), 2, RoundingMode.HALF_UP);
		}

		private static BigDecimal deriveProteinGoalG(int dailyCalorieGoal) {
			return BigDecimal.valueOf(dailyCalorieGoal)
				.multiply(BigDecimal.valueOf(0.25))
				.divide(BigDecimal.valueOf(4), 2, RoundingMode.HALF_UP);
		}

		private static BigDecimal deriveFatGoalG(int dailyCalorieGoal) {
			return BigDecimal.valueOf(dailyCalorieGoal)
				.multiply(BigDecimal.valueOf(0.25))
				.divide(BigDecimal.valueOf(9), 2, RoundingMode.HALF_UP);
		}
	}

	public record ProfileScreenResponse(
		String displayName,
		String profileImageUrl,
		int startedDaysAgo,
		String levelLabel,
		String streakLabel,
		List<ProfileSummaryStatResponse> summaryStats,
		ProfileGoalResponse goal,
		List<ProfileMetricResponse> metrics,
		List<ProfileShortcutResponse> shortcuts
	) {
	}

	public record ProfileSummaryStatResponse(
		String label,
		String value
	) {
	}

	public record ProfileGoalResponse(
		String label,
		int percent,
		String helper
	) {
	}

	public record ProfileMetricResponse(
		String key,
		String label,
		String value,
		String unit,
		String delta,
		String deltaDirection,
		String color,
		List<BigDecimal> series,
		List<String> dateLabels
	) {
	}

	public record ProfileShortcutResponse(
		String label,
		String description,
		String href
	) {
	}

	@Transactional(readOnly = true)
	public RoutineOverviewResponse getRoutineOverview(String authToken) {
		Long userId = this.authTokenService.parseUserId(authToken);
		List<Routine> routines = this.routineRepository.findActiveRoutinesForOverview(userId);

		return new RoutineOverviewResponse(
			"\uB8E8\uD2F4 \uC774\uB984 \uAC80\uC0C9",
			"\uB0B4 \uB8E8\uD2F4 (" + routines.size() + ")",
			"\uD3B8\uC9D1",
			"\uC0C8 \uB8E8\uD2F4 \uB9CC\uB4E4\uAE30",
			"\uC774 \uB8E8\uD2F4\uC73C\uB85C \uC2DC\uC791\uD558\uAE30",
			toRoutineCards(routines)
		);
	}

	@Transactional(readOnly = true)
	public WeeklyAnalysisResponse getWeeklyAnalysis(String authToken) {
		return getWeeklyAnalysis(authToken, null);
	}

	@Transactional(readOnly = true)
	public WeeklyAnalysisResponse getWeeklyAnalysis(String authToken, LocalDate requestedWeekStart) {
		Long userId = this.authTokenService.parseUserId(authToken);
		LocalDate today = LocalDate.now(SEOUL);
		LocalDate currentWeekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
		LocalDate weekStart = normalizeWeekStart(requestedWeekStart, currentWeekStart);
		LocalDate weekEnd = weekStart.plusDays(6);
		LocalDate previousWeekStart = weekStart.minusDays(7);
		LocalDate previousWeekEnd = weekStart.minusDays(1);
		List<WorkoutSession> weeklyWorkoutSessions = this.workoutSessionRepository.findByUserIdAndSessionDateBetween(userId, weekStart, weekEnd);
		List<WorkoutSession> previousWeeklyWorkoutSessions = this.workoutSessionRepository
			.findByUserIdAndSessionDateBetween(userId, previousWeekStart, previousWeekEnd);
		List<WorkoutSession> completedWorkoutSessions = completedSessions(weeklyWorkoutSessions);
		int totalWorkoutMinutes = totalWorkoutMinutes(completedWorkoutSessions);
		int previousWorkoutMinutes = totalWorkoutMinutes(completedSessions(previousWeeklyWorkoutSessions));
		int totalCaloriesBurned = totalWorkoutCalories(completedWorkoutSessions);
		NutritionTotals weeklyNutrition = loadNutrition(this.mealLogRepository.findByUserIdAndLoggedDateBetween(userId, weekStart, weekEnd));

		return new WeeklyAnalysisResponse(
			KoreanDateText.formatWeekLabel(weekStart),
			KoreanDateText.formatWeekRange(weekStart, weekStart.plusDays(6)),
			weekStart.toString(),
			currentWeekStart.toString(),
			"\uCD1D " + formatLongDuration(totalWorkoutMinutes) + " \uC6B4\uB3D9\uD588\uC5B4\uC694",
			workoutComparison(totalWorkoutMinutes, previousWorkoutMinutes),
			buildWorkoutBars(completedWorkoutSessions, weekStart, today),
			List.of(
				new KpiResponse("\uC644\uB8CC \uC138\uC158", completedWorkoutSessions.size() + "\uD68C", "text-slate-900"),
				new KpiResponse("\uC8FC\uAC04 \uC18C\uBAA8 \uCE7C\uB85C\uB9AC", formatInteger(totalCaloriesBurned) + " kcal", "text-orange-500")
			),
			buildMacroResponses(weeklyNutrition),
			buildWeeklyInsight(weeklyNutrition)
		);
	}

	private static LocalDate normalizeWeekStart(LocalDate requestedWeekStart, LocalDate currentWeekStart) {
		if (requestedWeekStart == null) {
			return currentWeekStart;
		}

		LocalDate normalized = requestedWeekStart.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
		return normalized.isAfter(currentWeekStart) ? currentWeekStart : normalized;
	}

	private List<RoutineCardResponse> toRoutineCards(List<Routine> routines) {
		List<RoutineCardResponse> responses = new ArrayList<>();
		for (int index = 0; index < routines.size(); index++) {
			Routine routine = routines.get(index);
			long scheduleCount = this.routineScheduleRepository.countByRoutineId(routine.getId());
			long exerciseCount = this.routineExerciseRepository.countByRoutineId(routine.getId());
			responses.add(new RoutineCardResponse(
				routine.getId(),
				routine.getName(),
				"\uC8FC " + scheduleCount + "\uD68C",
				optionalText(routine.getDescription()),
				exerciseCount > 0 ? exerciseCount + "\uAC1C \uC6B4\uB3D9 \uAD6C\uC131" : null,
				exerciseCount > 0 ? "\uC18C\uC694 \uC2DC\uAC04 \uBBF8\uAE30\uB85D" : null,
				routineTone(index),
				"dumbbell",
				index == 0 ? "dark" : "muted",
				false,
				false
			));
		}

		return responses;
	}

	private static List<WorkoutSession> completedSessions(List<WorkoutSession> sessions) {
		return sessions.stream()
			.filter(session -> session.getStatus() == WorkoutStatus.COMPLETED)
			.toList();
	}

	private static int totalWorkoutMinutes(List<WorkoutSession> sessions) {
		return sessions.stream()
			.map(WorkoutSession::getDurationMinutes)
			.filter(value -> value != null)
			.mapToInt(Integer::intValue)
			.sum();
	}

	private static int totalWorkoutCalories(List<WorkoutSession> sessions) {
		return sessions.stream()
			.map(WorkoutSession::getCaloriesBurned)
			.filter(value -> value != null)
			.mapToInt(Integer::intValue)
			.sum();
	}

	private static List<WorkoutBarResponse> buildWorkoutBars(List<WorkoutSession> sessions, LocalDate weekStart, LocalDate today) {
		List<Integer> dailyMinutes = new ArrayList<>();
		int maxMinutes = 0;
		for (int dayOffset = 0; dayOffset < 7; dayOffset++) {
			int minutes = workoutMinutesOn(sessions, weekStart.plusDays(dayOffset));
			dailyMinutes.add(minutes);
			maxMinutes = Math.max(maxMinutes, minutes);
		}

		List<WorkoutBarResponse> bars = new ArrayList<>();
		for (int dayOffset = 0; dayOffset < 7; dayOffset++) {
			LocalDate date = weekStart.plusDays(dayOffset);
			int minutes = dailyMinutes.get(dayOffset);
			int height = maxMinutes == 0 || minutes == 0 ? 0 : Math.max(8, Math.round((float) minutes * 100 / maxMinutes));
			bars.add(new WorkoutBarResponse(KoreanDateText.formatWeekday(date), height, date.equals(today)));
		}

		return bars;
	}

	private static int workoutMinutesOn(List<WorkoutSession> sessions, LocalDate date) {
		return sessions.stream()
			.filter(session -> session.getSessionDate().equals(date))
			.map(WorkoutSession::getDurationMinutes)
			.filter(value -> value != null)
			.mapToInt(Integer::intValue)
			.sum();
	}

	private static List<MacroResponse> buildMacroResponses(NutritionTotals nutrition) {
		BigDecimal total = nutrition.carbG().add(nutrition.proteinG()).add(nutrition.fatG());

		return List.of(
			new MacroResponse("\uB2E8\uBC31\uC9C8", macroPercent(nutrition.proteinG(), total) + "%", "#4f46e5"),
			new MacroResponse("\uD0C4\uC218\uD654\uBB3C", macroPercent(nutrition.carbG(), total) + "%", "#60a5fa"),
			new MacroResponse("\uC9C0\uBC29", macroPercent(nutrition.fatG(), total) + "%", "#f59e0b")
		);
	}

	private static String buildWeeklyInsight(NutritionTotals nutrition) {
		BigDecimal total = nutrition.carbG().add(nutrition.proteinG()).add(nutrition.fatG());
		if (total.signum() <= 0) {
			return "\uAE30\uB85D\uB41C \uC2DD\uB2E8 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.";
		}

		String dominantLabel = "\uB2E8\uBC31\uC9C8";
		BigDecimal dominantValue = nutrition.proteinG();
		if (nutrition.carbG().compareTo(dominantValue) > 0) {
			dominantLabel = "\uD0C4\uC218\uD654\uBB3C";
			dominantValue = nutrition.carbG();
		}
		if (nutrition.fatG().compareTo(dominantValue) > 0) {
			dominantLabel = "\uC9C0\uBC29";
		}

		return "\uC774\uBC88 \uC8FC\uB294 " + dominantLabel + " \uC12D\uCDE8 \uBE44\uC911\uC774 \uAC00\uC7A5 \uB192\uC2B5\uB2C8\uB2E4.";
	}

	private static int macroPercent(BigDecimal value, BigDecimal total) {
		if (total.signum() <= 0) {
			return 0;
		}

		return clamp(value.multiply(BigDecimal.valueOf(100)).divide(total, 0, RoundingMode.HALF_UP).intValue());
	}

	private static String workoutComparison(int currentMinutes, int previousMinutes) {
		if (previousMinutes <= 0) {
			return "\uC9C0\uB09C \uC8FC \uAE30\uB85D \uC5C6\uC74C";
		}

		int percent = Math.round((float) (currentMinutes - previousMinutes) * 100 / previousMinutes);
		String sign = percent > 0 ? "+" : "";
		return "\uC9C0\uB09C \uC8FC \uB300\uBE44 " + sign + percent + "%";
	}

	private static String formatLongDuration(int minutes) {
		if (minutes <= 0) {
			return "0\uBD84";
		}

		int hours = minutes / 60;
		int remainingMinutes = minutes % 60;
		if (hours == 0) {
			return remainingMinutes + "\uBD84";
		}
		if (remainingMinutes == 0) {
			return hours + "\uC2DC\uAC04";
		}

		return hours + "\uC2DC\uAC04 " + remainingMinutes + "\uBD84";
	}

	private static String optionalText(String value) {
		return value == null ? "" : value;
	}

	private static String routineTone(int index) {
		return switch (index % 3) {
			case 1 -> "emerald";
			case 2 -> "orange";
			default -> "indigo";
		};
	}

	public record HomeDashboardResponse(
		String todayRecordLabel,
		String dateLabel,
		List<String> recordChips,
		int goalPercent,
		String nutritionStatus,
		List<SummaryCardResponse> summaryCards,
		List<NutritionProgressResponse> nutritionProgress,
		WorkoutResponse workout,
		List<WeeklySummaryItemResponse> weeklySummary
	) {
	}

	public record SummaryCardResponse(
		String label,
		String value,
		String subValue,
		String status
	) {
	}

	public record NutritionProgressResponse(
		String label,
		int percent,
		String colorClass
	) {
	}

	public record WorkoutResponse(
		String title,
		String routine,
		String progressLabel,
		String duration,
		String calories,
		String actionLabel
	) {
	}

	public record WeeklySummaryItemResponse(
		String label,
		String value,
		String helper,
		String valueClass
	) {
	}

	public record RoutineOverviewResponse(
		String searchPlaceholder,
		String sectionTitle,
		String editLabel,
		String createActionLabel,
		String startActionLabel,
		List<RoutineCardResponse> routines
	) {
	}

	public record RoutineCardResponse(
		Long id,
		String title,
		String frequencyLabel,
		String description,
		String exerciseSummary,
		String duration,
		String tone,
		String icon,
		String buttonVariant,
		boolean disabled,
		boolean subdued
	) {
	}

	public record WeeklyAnalysisResponse(
		String weekLabel,
		String dateRange,
		String weekStart,
		String currentWeekStart,
		String totalWorkout,
		String comparison,
		List<WorkoutBarResponse> workoutBars,
		List<KpiResponse> kpis,
		List<MacroResponse> macros,
		String insight
	) {
	}

	public record WorkoutBarResponse(
		String label,
		int height,
		boolean active
	) {
	}

	public record KpiResponse(
		String label,
		String value,
		String valueClass
	) {
	}

	public record MacroResponse(
		String label,
		String value,
		String color
	) {
	}
}
