package com.fitlog.server.content.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitlog.server.common.support.KoreanDateText;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AppContentControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Test
	void homeDashboardEndpointReturnsExpectedShape() throws Exception {
		this.mockMvc.perform(get("/api/home/dashboard")
				.header("Authorization", "Bearer " + loginToken("home-dashboard")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.dateLabel").isString())
			.andExpect(jsonPath("$.summaryCards[0].label").value("\uCE7C\uB85C\uB9AC"))
			.andExpect(jsonPath("$.nutritionProgress.length()").value(4))
			.andExpect(jsonPath("$.workout.progressLabel").value("0/0 \uC644\uB8CC"));
	}

	@Test
	void homeDashboardEndpointRequiresAuthorization() throws Exception {
		this.mockMvc.perform(get("/api/home/dashboard"))
			.andExpect(status().isUnauthorized());
	}

	@Test
	void profileEndpointReflectsSavedBodyMetrics() throws Exception {
		String token = loginToken("profile-body-metrics");

		this.mockMvc.perform(post("/api/records/body-metrics")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "weightKg": 74.8,
					  "skeletalMuscleKg": 34.1,
					  "bodyFatPercent": 18.7
					}
					"""))
			.andExpect(status().isOk());

		this.mockMvc.perform(get("/api/account/profile")
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.metrics[0].label").value("\uBAB8\uBB34\uAC8C"))
			.andExpect(jsonPath("$.metrics[0].value").value("74.8"))
			.andExpect(jsonPath("$.metrics[0].series[0]").value(74.8))
			.andExpect(jsonPath("$.metrics[0].dateLabels.length()").value(1))
			.andExpect(jsonPath("$.metrics[1].value").value("34.1"))
			.andExpect(jsonPath("$.metrics[2].value").value("18.7"));
	}

	@Test
	void profileNicknameCanBeUpdated() throws Exception {
		String token = loginToken("profile-nickname");

		this.mockMvc.perform(patch("/api/account/profile")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "nickname": "FitLog Master"
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.displayName").value("FitLog Master"));

		this.mockMvc.perform(post("/api/account/profile")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "nickname": "FitLog Strong"
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.displayName").value("FitLog Strong"));

		this.mockMvc.perform(get("/api/auth/me")
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.nickname").value("FitLog Strong"));
	}

	@Test
	void routineOverviewEndpointReturnsSavedRoutineCards() throws Exception {
		String token = loginToken("routine-overview");

		this.mockMvc.perform(post("/api/routines")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "name": "Push A",
					  "activeDays": ["MONDAY", "WEDNESDAY", "FRIDAY"],
					  "exercises": [
					    {
					      "name": "Bench Press",
					      "group": "Chest",
					      "sets": [
					        { "weight": 60.0, "reps": 10 }
					      ]
					    }
					  ]
					}
					"""))
			.andExpect(status().isOk());

		this.mockMvc.perform(get("/api/routines/overview")
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.sectionTitle").value("\uB0B4 \uB8E8\uD2F4 (1)"))
			.andExpect(jsonPath("$.routines.length()").value(1))
			.andExpect(jsonPath("$.routines[0].title").value("Push A"))
			.andExpect(jsonPath("$.routines[0].frequencyLabel").value("\uC8FC 3\uD68C"))
			.andExpect(jsonPath("$.routines[0].exerciseSummary").value("1\uAC1C \uC6B4\uB3D9 \uAD6C\uC131"));
	}

	@Test
	void routineCreateNewFlagCreatesAdditionalRoutine() throws Exception {
		String token = loginToken("routine-create-new");

		this.mockMvc.perform(post("/api/routines")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "name": "Push A",
					  "activeDays": ["MONDAY"],
					  "exercises": [
					    {
					      "name": "Bench Press",
					      "group": "Chest",
					      "sets": [
					        { "weight": 60.0, "reps": 10 }
					      ]
					    }
					  ]
					}
					"""))
			.andExpect(status().isOk());

		this.mockMvc.perform(post("/api/routines")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "name": "Pull B",
					  "activeDays": ["TUESDAY", "THURSDAY"],
					  "createNew": true,
					  "exercises": [
					    {
					      "name": "Lat Pulldown",
					      "group": "Back",
					      "sets": [
					        { "weight": 45.0, "reps": 12 }
					      ]
					    }
					  ]
					}
					"""))
			.andExpect(status().isOk());

		this.mockMvc.perform(get("/api/routines/overview")
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.sectionTitle").value("\uB0B4 \uB8E8\uD2F4 (2)"))
			.andExpect(jsonPath("$.routines.length()").value(2))
			.andExpect(jsonPath("$.routines[0].title").value("Pull B"))
			.andExpect(jsonPath("$.routines[1].title").value("Push A"));
	}

	@Test
	void routineManagementCanReorderAndDeleteRoutines() throws Exception {
		String token = loginToken("routine-management");
		Long firstRoutineId = createRoutine(token, "First Routine", false);
		Long secondRoutineId = createRoutine(token, "Second Routine", true);

		this.mockMvc.perform(post("/api/routines/reorder")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "routineIds": [%d, %d]
					}
					""".formatted(firstRoutineId, secondRoutineId)))
			.andExpect(status().isOk());

		this.mockMvc.perform(get("/api/routines/overview")
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.routines[0].title").value("First Routine"))
			.andExpect(jsonPath("$.routines[1].title").value("Second Routine"));

		this.mockMvc.perform(post("/api/routines/%d/delete".formatted(firstRoutineId))
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk());

		this.mockMvc.perform(get("/api/routines/overview")
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.sectionTitle").value("\uB0B4 \uB8E8\uD2F4 (1)"))
			.andExpect(jsonPath("$.routines.length()").value(1))
			.andExpect(jsonPath("$.routines[0].title").value("Second Routine"));
	}

	@Test
	void routineOverviewEndpointRequiresAuthorization() throws Exception {
		this.mockMvc.perform(get("/api/routines/overview"))
			.andExpect(status().isUnauthorized());
	}

	@Test
	void workoutLogEndpointLoadsSelectedRoutineExercises() throws Exception {
		String token = loginToken("workout-log-routine");
		MvcResult result = this.mockMvc.perform(post("/api/routines")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "name": "Push Day",
					  "activeDays": ["MONDAY"],
					  "exercises": [
					    {
					      "name": "Bench Press",
					      "group": "Chest",
					      "sets": [
					        { "weight": 60.0, "reps": 10 },
					        { "weight": 62.5, "reps": 8 }
					      ]
					    },
					    {
					      "name": "Shoulder Press",
					      "group": "Shoulder",
					      "sets": [
					        { "weight": 30.0, "reps": 12 }
					      ]
					    }
					  ]
					}
					"""))
			.andExpect(status().isOk())
			.andReturn();
		Long routineId = this.objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();

		this.mockMvc.perform(get("/api/records/workouts/today")
				.queryParam("routineId", routineId.toString())
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.routineId").value(routineId))
			.andExpect(jsonPath("$.exerciseName").value("Bench Press"))
			.andExpect(jsonPath("$.routineTemplate.length()").value(2))
			.andExpect(jsonPath("$.routineExercises.length()").value(2))
			.andExpect(jsonPath("$.routineExercises[0].name").value("Bench Press"))
			.andExpect(jsonPath("$.routineExercises[0].sets.length()").value(2))
			.andExpect(jsonPath("$.routineExercises[1].name").value("Shoulder Press"))
			.andExpect(jsonPath("$.routineExercises[1].sets[0].reps").value(12));
	}

	@Test
	void weeklyAnalysisEndpointReturnsRecordedWeeklyMetrics() throws Exception {
		String token = loginToken("weekly-analysis");

		this.mockMvc.perform(post("/api/records/workouts")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "durationMinutes": 45,
					  "caloriesBurned": 320,
					  "intensity": "MODERATE",
					  "exercises": [
					    {
					      "name": "Bench Press",
					      "sets": [
					        { "weightKg": 60.0, "repetitions": 10, "completed": true }
					      ]
					    }
					  ]
					}
					"""))
			.andExpect(status().isOk());

		this.mockMvc.perform(post("/api/records/meals")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "mealType": "LUNCH",
					  "foodName": "Chicken Rice",
					  "quantity": 1.0,
					  "quantityUnit": "SERVING",
					  "caloriesKcal": 500,
					  "carbG": 50.0,
					  "proteinG": 25.0,
					  "fatG": 10.0
					}
					"""))
			.andExpect(status().isOk());

		this.mockMvc.perform(get("/api/analytics/weekly")
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.weekLabel").isString())
			.andExpect(jsonPath("$.workoutBars.length()").value(7))
			.andExpect(jsonPath("$.kpis[0].value").value("1\uD68C"))
			.andExpect(jsonPath("$.kpis[1].value").value("320 kcal"))
			.andExpect(jsonPath("$.macros[1].value").value("59%"));
	}

	@Test
	void weeklyAnalysisEndpointAcceptsWeekStartQuery() throws Exception {
		String token = loginToken("weekly-analysis-week-start");
		LocalDate currentWeekStart = LocalDate.now(ZoneId.of("Asia/Seoul"))
			.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
		LocalDate previousWeekStart = currentWeekStart.minusDays(7);

		this.mockMvc.perform(get("/api/analytics/weekly")
				.queryParam("weekStart", previousWeekStart.toString())
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.weekStart").value(previousWeekStart.toString()))
			.andExpect(jsonPath("$.currentWeekStart").value(currentWeekStart.toString()))
			.andExpect(jsonPath("$.dateRange").value(KoreanDateText.formatWeekRange(
				previousWeekStart,
				previousWeekStart.plusDays(6)
			)));
	}

	@Test
	void weeklyAnalysisEndpointRequiresAuthorization() throws Exception {
		this.mockMvc.perform(get("/api/analytics/weekly"))
			.andExpect(status().isUnauthorized());
	}

	private String loginToken(String key) throws Exception {
		MvcResult result = this.mockMvc.perform(post("/api/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "socialType": "KAKAO",
					  "providerUserId": "fitlog-demo-%s",
					  "email": "kakao.%s@fitlog.local",
					  "nickname": "Kakao User"
					}
					""".formatted(key, key)))
			.andExpect(status().isOk())
			.andReturn();

		return this.objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
	}

	private Long createRoutine(String token, String name, boolean createNew) throws Exception {
		MvcResult result = this.mockMvc.perform(post("/api/routines")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "name": "%s",
					  "activeDays": ["MONDAY"],
					  "createNew": %s,
					  "exercises": [
					    {
					      "name": "Bench Press",
					      "group": "Chest",
					      "sets": [
					        { "weight": 60.0, "reps": 10 }
					      ]
					    }
					  ]
					}
					""".formatted(name, createNew)))
			.andExpect(status().isOk())
			.andReturn();

		return this.objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
	}
}
