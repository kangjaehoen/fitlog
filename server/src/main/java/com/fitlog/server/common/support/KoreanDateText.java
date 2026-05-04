package com.fitlog.server.common.support;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Locale;

public final class KoreanDateText {

	private static final Locale LOCALE = Locale.KOREAN;

	private KoreanDateText() {
	}

	public static String formatDailyLabel(LocalDate date) {
		return String.format(
			Locale.ROOT,
			"%d\uB144 %d\uC6D4 %d\uC77C (%s)",
			date.getYear(),
			date.getMonthValue(),
			date.getDayOfMonth(),
			formatWeekday(date)
		);
	}

	public static String formatWeekLabel(LocalDate date) {
		return String.format(
			Locale.ROOT,
			"%d\uC6D4 %d\uC8FC\uCC28",
			date.getMonthValue(),
			mondayOrdinalInMonth(date)
		);
	}

	public static String formatWeekRange(LocalDate startDate, LocalDate endDate) {
		return formatMonthDay(startDate) + " - " + formatMonthDay(endDate);
	}

	public static String formatWeekday(LocalDate date) {
		return date.getDayOfWeek().getDisplayName(java.time.format.TextStyle.NARROW, LOCALE);
	}

	private static String formatMonthDay(LocalDate date) {
		return String.format(
			Locale.ROOT,
			"%d\uC6D4 %d\uC77C (%s)",
			date.getMonthValue(),
			date.getDayOfMonth(),
			formatWeekday(date)
		);
	}

	private static int mondayOrdinalInMonth(LocalDate date) {
		LocalDate firstMonday = date.withDayOfMonth(1);
		while (firstMonday.getDayOfWeek() != DayOfWeek.MONDAY) {
			firstMonday = firstMonday.plusDays(1);
		}

		if (date.isBefore(firstMonday)) {
			return 1;
		}

		return ((date.getDayOfMonth() - firstMonday.getDayOfMonth()) / 7) + 1;
	}
}
