package com.fitlog.server.content.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AppContentControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void homeDashboardEndpointReturnsExpectedShape() throws Exception {
		this.mockMvc.perform(get("/api/home/dashboard"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.dateLabel").isString())
			.andExpect(jsonPath("$.summaryCards[0].label").value("\uCE7C\uB85C\uB9AC"))
			.andExpect(jsonPath("$.nutritionProgress.length()").value(4))
			.andExpect(jsonPath("$.workout.progressLabel").value("4/5 \uC644\uB8CC"));
	}

	@Test
	void routineOverviewEndpointReturnsRoutineCards() throws Exception {
		this.mockMvc.perform(get("/api/routines/overview"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.sectionTitle").value("\uB0B4 \uB8E8\uD2F4 (4)"))
			.andExpect(jsonPath("$.routines.length()").value(4))
			.andExpect(jsonPath("$.routines[0].tone").value("indigo"));
	}

	@Test
	void weeklyAnalysisEndpointReturnsWeeklyMetrics() throws Exception {
		this.mockMvc.perform(get("/api/analytics/weekly"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.weekLabel").isString())
			.andExpect(jsonPath("$.workoutBars.length()").value(7))
			.andExpect(jsonPath("$.macros[1].value").value("39%"));
	}
}
