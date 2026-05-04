package com.fitlog.server.common.support;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

class KoreanDateTextTest {

	@Test
	void formatWeekLabelCountsMondaysInMonth() {
		assertThat(KoreanDateText.formatWeekLabel(LocalDate.of(2026, 5, 4))).isEqualTo("5\uC6D4 1\uC8FC\uCC28");
		assertThat(KoreanDateText.formatWeekLabel(LocalDate.of(2026, 4, 27))).isEqualTo("4\uC6D4 4\uC8FC\uCC28");
	}
}
