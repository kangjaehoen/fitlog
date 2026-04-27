package com.fitlog.server.auth.api;

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

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Test
	void socialLoginCreatesUserAndReturnsCurrentUser() throws Exception {
		MvcResult loginResult = this.mockMvc.perform(post("/api/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "socialType": "KAKAO",
					  "providerUserId": "fitlog-test-kakao",
					  "email": "kakao.test@fitlog.local",
					  "nickname": "Kakao Tester"
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.token").isString())
			.andExpect(jsonPath("$.user.email").value("kakao.test@fitlog.local"))
			.andExpect(jsonPath("$.user.nickname").value("Kakao Tester"))
			.andReturn();

		JsonNode loginJson = this.objectMapper.readTree(loginResult.getResponse().getContentAsString());
		String token = loginJson.path("token").asText();

		this.mockMvc.perform(get("/api/auth/me")
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.email").value("kakao.test@fitlog.local"))
			.andExpect(jsonPath("$.socialType").value("KAKAO"));
	}

	@Test
	void currentUserRejectsMissingToken() throws Exception {
		this.mockMvc.perform(get("/api/auth/me"))
			.andExpect(status().isUnauthorized());
	}
}
