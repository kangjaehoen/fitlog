package com.fitlog.server.auth.application;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@Component
public class GoogleOAuthClient {

	private static final String AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth";
	private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";
	private static final String USER_INFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
	private static final String REQUIRED_SCOPES = "openid email profile";
	private static final int MAX_NICKNAME_LENGTH = 40;

	private final GoogleOAuthProperties properties;
	private final RestClient restClient;

	public GoogleOAuthClient(GoogleOAuthProperties properties) {
		this.properties = properties;
		this.restClient = RestClient.builder().build();
	}

	public String buildAuthorizationUrl() {
		if (!this.properties.isConfigured()) {
			throw new GoogleOAuthException("Google OAuth is not configured");
		}

		return UriComponentsBuilder.fromUriString(AUTHORIZATION_URL)
			.queryParam("response_type", "code")
			.queryParam("client_id", this.properties.clientId())
			.queryParam("redirect_uri", this.properties.redirectUri())
			.queryParam("scope", REQUIRED_SCOPES)
			.queryParam("prompt", "select_account")
			.build()
			.toUriString();
	}

	public GoogleUser fetchUser(String authorizationCode) {
		GoogleTokenResponse token = requestToken(authorizationCode);
		GoogleUserInfoResponse userInfo = requestUserInfo(token.accessToken());

		if (userInfo == null || !hasText(userInfo.sub())) {
			throw new GoogleOAuthException("Google user response did not include a subject");
		}

		String providerUserId = userInfo.sub().trim();

		return new GoogleUser(
			providerUserId,
			resolveEmail(userInfo, providerUserId),
			resolveNickname(userInfo, providerUserId)
		);
	}

	private GoogleTokenResponse requestToken(String authorizationCode) {
		MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
		body.add("grant_type", "authorization_code");
		body.add("client_id", this.properties.clientId());
		body.add("client_secret", this.properties.clientSecret());
		body.add("redirect_uri", this.properties.redirectUri());
		body.add("code", authorizationCode);

		try {
			GoogleTokenResponse response = this.restClient.post()
				.uri(TOKEN_URL)
				.contentType(MediaType.APPLICATION_FORM_URLENCODED)
				.body(body)
				.retrieve()
				.body(GoogleTokenResponse.class);

			if (response == null || !hasText(response.accessToken())) {
				throw new GoogleOAuthException("Google token response did not include an access token");
			}

			return response;
		}
		catch (RestClientException exception) {
			throw new GoogleOAuthException("Could not exchange Google authorization code", exception);
		}
	}

	private GoogleUserInfoResponse requestUserInfo(String accessToken) {
		try {
			return this.restClient.get()
				.uri(USER_INFO_URL)
				.header("Authorization", "Bearer " + accessToken)
				.retrieve()
				.body(GoogleUserInfoResponse.class);
		}
		catch (RestClientException exception) {
			throw new GoogleOAuthException("Could not fetch Google user information", exception);
		}
	}

	private static String resolveEmail(GoogleUserInfoResponse userInfo, String providerUserId) {
		if (hasText(userInfo.email()) && !Boolean.FALSE.equals(userInfo.emailVerified())) {
			return userInfo.email().trim();
		}

		return "google-" + providerUserId + "@users.fitlog.local";
	}

	private static String resolveNickname(GoogleUserInfoResponse userInfo, String providerUserId) {
		if (hasText(userInfo.name())) {
			return truncateNickname(userInfo.name().trim());
		}

		if (hasText(userInfo.email())) {
			return truncateNickname(userInfo.email().trim().split("@")[0]);
		}

		return truncateNickname("Google User " + providerUserId);
	}

	private static boolean hasText(String value) {
		return value != null && !value.isBlank();
	}

	private static String truncateNickname(String value) {
		if (value.length() <= MAX_NICKNAME_LENGTH) {
			return value;
		}

		return value.substring(0, MAX_NICKNAME_LENGTH);
	}

	public record GoogleUser(
		String providerUserId,
		String email,
		String nickname
	) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	private record GoogleTokenResponse(
		@JsonProperty("access_token") String accessToken
	) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	private record GoogleUserInfoResponse(
		String sub,
		String email,
		String name,
		@JsonProperty("email_verified") Boolean emailVerified
	) {
	}
}
