package com.fitlog.server.push.api;

import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitlog.server.push.domain.NotificationSchedule;
import com.fitlog.server.push.domain.NotificationScheduleRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NotificationScheduleControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private NotificationScheduleRepository notificationScheduleRepository;

	@Test
	void returnsSentNotificationsAndMarksRead() throws Exception {
		LoginSession session = login();
		NotificationSchedule schedule = NotificationSchedule.create(
			session.userId(),
			"운동 알림",
			"오늘 운동 시간이 되었어요.",
			"/today-workout-log",
			LocalDateTime.now().minusMinutes(10)
		);
		schedule.markSent(LocalDateTime.now().minusMinutes(5));
		Long scheduleId = this.notificationScheduleRepository.save(schedule).getId();

		this.mockMvc.perform(get("/api/notifications/schedules?status=SENT")
				.header("Authorization", "Bearer " + session.token()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[0].id").value(scheduleId))
			.andExpect(jsonPath("$[0].readAt").value(nullValue()));

		this.mockMvc.perform(patch("/api/notifications/schedules/{id}/read", scheduleId)
				.header("Authorization", "Bearer " + session.token()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.id").value(scheduleId))
			.andExpect(jsonPath("$.readAt").value(notNullValue()));

		this.mockMvc.perform(get("/api/notifications/schedules/{id}", scheduleId)
				.header("Authorization", "Bearer " + session.token()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.readAt").value(notNullValue()));
	}

	private LoginSession login() throws Exception {
		MvcResult loginResult = this.mockMvc.perform(post("/api/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "socialType": "KAKAO",
					  "providerUserId": "fitlog-notification-test-kakao",
					  "email": "notification.test@fitlog.local",
					  "nickname": "Notification Tester"
					}
					"""))
			.andExpect(status().isOk())
			.andReturn();

		JsonNode loginJson = this.objectMapper.readTree(loginResult.getResponse().getContentAsString());
		return new LoginSession(
			loginJson.path("token").asText(),
			loginJson.path("user").path("id").asLong()
		);
	}

	private record LoginSession(String token, Long userId) {
	}
}
