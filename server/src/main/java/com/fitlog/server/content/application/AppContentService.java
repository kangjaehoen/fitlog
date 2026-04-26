package com.fitlog.server.content.application;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

import org.springframework.stereotype.Service;

import com.fitlog.server.common.support.KoreanDateText;

@Service
public class AppContentService {

	private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

	public HomeDashboardResponse getHomeDashboard() {
		LocalDate today = LocalDate.now(SEOUL);

		return new HomeDashboardResponse(
			"\uC624\uB298 \uAE30\uB85D",
			KoreanDateText.formatDailyLabel(today),
			List.of(
				"\uC2DD\uB2E8 4\uD68C",
				"\uC6B4\uB3D9 \uC644\uB8CC",
				"\uC218\uBD84 \uCDA9\uC871"
			),
			86,
			"\uBAA9\uD45C 86% \uB2EC\uC131",
			List.of(
				new SummaryCardResponse("\uCE7C\uB85C\uB9AC", "1,970", "/ 2,300 kcal", null),
				new SummaryCardResponse("\uB2E8\uBC31\uC9C8", "146", "/ 160g", null),
				new SummaryCardResponse("\uC6B4\uB3D9", "\uC644\uB8CC", null, "\uC0C1\uCCB4 \uB8E8\uD2F4 \uAE30\uB85D \uC644\uB8CC"),
				new SummaryCardResponse("\uCCB4\uC911", "70.8", "kg", null)
			),
			List.of(
				new NutritionProgressResponse("\uCE7C\uB85C\uB9AC", 86, "bg-[#f6bcc8]"),
				new NutritionProgressResponse("\uD0C4\uC218\uD654\uBB3C", 74, "bg-[#b1a6fb]"),
				new NutritionProgressResponse("\uB2E8\uBC31\uC9C8", 91, "bg-[#8fd5ad]"),
				new NutritionProgressResponse("\uC9C0\uBC29", 58, "bg-[#95d9e4]")
			),
			new WorkoutResponse(
				"\uC624\uB298 \uC6B4\uB3D9",
				"\uC624\uB298\uC758 \uB8E8\uD2F4: \uB4F1 + \uC774\uB450",
				"4/5 \uC644\uB8CC",
				"56\uBD84",
				"418 kcal"
			),
			List.of(
				new WeeklySummaryItemResponse("\uC6B4\uB3D9", "5\uD68C", "\uC774\uBC88 \uC8FC \uB8E8\uD2F4 \uC644\uC8FC", "text-slate-900"),
				new WeeklySummaryItemResponse("\uD3C9\uADE0 \uCE7C\uB85C\uB9AC", "2,040 kcal", "\uD45C\uC900 \uC12D\uCDE8\uB7C9 \uC548\uCC29", "text-orange-500"),
				new WeeklySummaryItemResponse("\uCCB4\uC911 \uBCC0\uD654", "-0.4kg", "\uC9C0\uB09C \uC8FC \uB300\uBE44", "text-indigo-600"),
				new WeeklySummaryItemResponse("\uC5F0\uC18D \uAE30\uB85D", "8\uC77C", "\uB85C\uADF8 \uAE30\uB85D \uC720\uC9C0 \uC911", "text-emerald-600")
			)
		);
	}

	public RoutineOverviewResponse getRoutineOverview() {
		return new RoutineOverviewResponse(
			"\uB8E8\uD2F4 \uC774\uB984 \uAC80\uC0C9",
			"\uB0B4 \uB8E8\uD2F4 (4)",
			"\uD3B8\uC9D1",
			"\uC0C8 \uB8E8\uD2F4 \uB9CC\uB4E4\uAE30",
			"\uC774 \uB8E8\uD2F4\uC73C\uB85C \uC2DC\uC791\uD558\uAE30",
			List.of(
				new RoutineCardResponse(
					"\uC0C1\uCCB4 \uD478\uC2DC A",
					"\uC8FC 3\uD68C",
					"\uAC00\uC2B4, \uC5B4\uAE68, \uC0BC\uB450 \uC9D1\uC911 \uB8E8\uD2F4",
					"6\uAC1C \uC6B4\uB3D9 \uAD6C\uC131",
					"\uC57D 65\uBD84 \uC18C\uC694",
					"indigo",
					"dumbbell",
					"dark",
					false,
					false
				),
				new RoutineCardResponse(
					"\uD558\uCCB4 + \uCF54\uC5B4 \uB370\uC774",
					"\uC8FC 2\uD68C",
					"\uD558\uCCB4 \uADF8\uB8F9\uACFC \uCF54\uC5B4 \uC548\uC815\uD654 \uC911\uC2EC",
					"5\uAC1C \uC6B4\uB3D9 \uAD6C\uC131",
					"\uC57D 52\uBD84 \uC18C\uC694",
					"emerald",
					"bolt",
					"muted",
					false,
					false
				),
				new RoutineCardResponse(
					"\uBC30\uD6C4 \uBC0F \uC720\uC0B0\uC18C",
					"\uC8FC 2\uD68C",
					"\uC9C0\uAD6C\uB825 \uBCF4\uAC15\uACFC \uCE7C\uB85C\uB9AC \uC18C\uBAA8 \uC704\uC8FC",
					"4\uAC1C \uC6B4\uB3D9 \uAD6C\uC131",
					"\uC57D 40\uBD84 \uC18C\uC694",
					"orange",
					"bolt",
					"muted",
					false,
					false
				),
				new RoutineCardResponse(
					"\uC8FC\uB9D0 \uD68C\uBCF5 \uC2A4\uD2B8\uB808\uCE6D",
					"\uC8FC 1\uD68C",
					"\uD53C\uB85C \uD68C\uBCF5\uC744 \uC704\uD55C \uAC00\uBCBC\uC6B4 \uC138\uC158",
					null,
					null,
					"orange",
					"bolt",
					"disabled",
					true,
					true
				)
			)
		);
	}

	public WeeklyAnalysisResponse getWeeklyAnalysis() {
		LocalDate today = LocalDate.now(SEOUL);
		LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
		LocalDate activeDate = weekStart.plusDays(3);

		return new WeeklyAnalysisResponse(
			KoreanDateText.formatWeekLabel(today),
			KoreanDateText.formatWeekRange(weekStart, weekStart.plusDays(6)),
			"\uCD1D 6\uC2DC\uAC04 10\uBD84 \uC6B4\uB3D9\uD588\uC5B4\uC694",
			"\uC9C0\uB09C \uC8FC \uB300\uBE44 +12%",
			List.of(
				new WorkoutBarResponse(KoreanDateText.formatWeekday(weekStart), 42, false),
				new WorkoutBarResponse(KoreanDateText.formatWeekday(weekStart.plusDays(1)), 68, false),
				new WorkoutBarResponse(KoreanDateText.formatWeekday(weekStart.plusDays(2)), 36, false),
				new WorkoutBarResponse(KoreanDateText.formatWeekday(activeDate), 88, true),
				new WorkoutBarResponse(KoreanDateText.formatWeekday(weekStart.plusDays(4)), 63, false),
				new WorkoutBarResponse(KoreanDateText.formatWeekday(weekStart.plusDays(5)), 22, false),
				new WorkoutBarResponse(KoreanDateText.formatWeekday(weekStart.plusDays(6)), 14, false)
			),
			List.of(
				new KpiResponse("\uC644\uB8CC \uC138\uC158", "5\uD68C", "text-slate-900"),
				new KpiResponse("\uC8FC\uAC04 \uC18C\uBAA8 \uCE7C\uB85C\uB9AC", "2,690 kcal", "text-orange-500")
			),
			List.of(
				new MacroResponse("\uB2E8\uBC31\uC9C8", "41%", "#4f46e5"),
				new MacroResponse("\uD0C4\uC218\uD654\uBB3C", "39%", "#60a5fa"),
				new MacroResponse("\uC9C0\uBC29", "20%", "#f59e0b")
			),
			"\uC774\uBC88 \uC8FC\uB294 \uB2E8\uBC31\uC9C8 \uC12D\uCDE8\uC640 \uC6B4\uB3D9 \uD68C\uBCF5 \uD750\uB984\uC774 \uC548\uC815\uC801\uC774\uC5C8\uC2B5\uB2C8\uB2E4. \uC8FC\uB9D0\uC5D0\uB294 \uC218\uBD84\uACFC \uD0C4\uC218\uD654\uBB3C \uBCF4\uCDA9\uB9CC \uC870\uAE08 \uB354 \uC2E0\uACBD \uC4F0\uBA74 \uC88B\uACA0\uC5B4\uC694."
		);
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
		String calories
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
