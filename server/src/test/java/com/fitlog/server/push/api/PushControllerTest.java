package com.fitlog.server.push.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import com.fitlog.server.push.domain.PushSubscriptionRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PushControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private PushSubscriptionRepository pushSubscriptionRepository;

	@Test
	void returnsVapidPublicKey() throws Exception {
		this.mockMvc.perform(get("/api/push/vapid-public-key"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.publicKey").value("test-vapid-public-key"));
	}

	@Test
	void savesAndDeletesPushSubscription() throws Exception {
		String token = loginAndGetToken();

		this.mockMvc.perform(post("/api/push/subscriptions")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "endpoint": "https://push.example.test/subscription/1",
					  "keys": {
					    "p256dh": "p256dh-key",
					    "auth": "auth-secret"
					  },
					  "userAgent": "MockMvc"
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.ok").value(true));

		this.mockMvc.perform(post("/api/push/subscriptions")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "endpoint": "https://push.example.test/subscription/1",
					  "keys": {
					    "p256dh": "updated-p256dh-key",
					    "auth": "updated-auth-secret"
					  },
					  "userAgent": "Updated MockMvc"
					}
					"""))
			.andExpect(status().isOk());

		org.assertj.core.api.Assertions.assertThat(this.pushSubscriptionRepository.findAll()).hasSize(1);

		this.mockMvc.perform(delete("/api/push/subscriptions")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "endpoint": "https://push.example.test/subscription/1"
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.ok").value(true));

		org.assertj.core.api.Assertions.assertThat(this.pushSubscriptionRepository.findAll()).isEmpty();
	}

	private String loginAndGetToken() throws Exception {
		MvcResult loginResult = this.mockMvc.perform(post("/api/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "socialType": "KAKAO",
					  "providerUserId": "fitlog-push-test-kakao",
					  "email": "push.test@fitlog.local",
					  "nickname": "Push Tester"
					}
					"""))
			.andExpect(status().isOk())
			.andReturn();

		JsonNode loginJson = this.objectMapper.readTree(loginResult.getResponse().getContentAsString());
		return loginJson.path("token").asText();
	}
}
