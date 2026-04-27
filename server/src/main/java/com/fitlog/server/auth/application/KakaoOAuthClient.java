package com.fitlog.server.auth.application;

import java.util.Map;

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
public class KakaoOAuthClient {

	private static final String AUTHORIZATION_URL = "https://kauth.kakao.com/oauth/authorize";
	private static final String TOKEN_URL = "https://kauth.kakao.com/oauth/token";
	private static final String USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";

	private final KakaoOAuthProperties properties;
	private final RestClient restClient;

	public KakaoOAuthClient(KakaoOAuthProperties properties) {
		this.properties = properties;
		this.restClient = RestClient.builder().build();
	}

	public String buildAuthorizationUrl() {
		if (!this.properties.isConfigured()) {
			throw new KakaoOAuthException("Kakao OAuth is not configured");
		}

		return UriComponentsBuilder.fromUriString(AUTHORIZATION_URL)
			.queryParam("response_type", "code")
			.queryParam("client_id", this.properties.clientId())
			.queryParam("redirect_uri", this.properties.redirectUri())
			.build()
			.toUriString();
	}

	public KakaoUser fetchUser(String authorizationCode) {
		KakaoTokenResponse token = requestToken(authorizationCode);
		KakaoUserInfoResponse userInfo = requestUserInfo(token.accessToken());

		if (userInfo == null || userInfo.id() == null) {
			throw new KakaoOAuthException("Kakao user response did not include an id");
		}

		String providerUserId = String.valueOf(userInfo.id());

		return new KakaoUser(
			providerUserId,
			resolveEmail(userInfo, providerUserId),
			resolveNickname(userInfo, providerUserId)
		);
	}

	private KakaoTokenResponse requestToken(String authorizationCode) {
		MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
		body.add("grant_type", "authorization_code");
		body.add("client_id", this.properties.clientId());
		body.add("redirect_uri", this.properties.redirectUri());
		body.add("code", authorizationCode);

		if (hasText(this.properties.clientSecret())) {
			body.add("client_secret", this.properties.clientSecret());
		}

		try {
			KakaoTokenResponse response = this.restClient.post()
				.uri(TOKEN_URL)
				.contentType(MediaType.APPLICATION_FORM_URLENCODED)
				.body(body)
				.retrieve()
				.body(KakaoTokenResponse.class);

			if (response == null || !hasText(response.accessToken())) {
				throw new KakaoOAuthException("Kakao token response did not include an access token");
			}

			return response;
		}
		catch (RestClientException exception) {
			throw new KakaoOAuthException("Could not exchange Kakao authorization code", exception);
		}
	}

	private KakaoUserInfoResponse requestUserInfo(String accessToken) {
		try {
			return this.restClient.get()
				.uri(USER_INFO_URL)
				.header("Authorization", "Bearer " + accessToken)
				.retrieve()
				.body(KakaoUserInfoResponse.class);
		}
		catch (RestClientException exception) {
			throw new KakaoOAuthException("Could not fetch Kakao user information", exception);
		}
	}

	private static String resolveEmail(KakaoUserInfoResponse userInfo, String providerUserId) {
		KakaoAccount account = userInfo.kakaoAccount();
		if (account != null && hasText(account.email())
			&& !Boolean.FALSE.equals(account.isEmailValid())
			&& !Boolean.FALSE.equals(account.isEmailVerified())) {
			return account.email().trim();
		}

		return "kakao-" + providerUserId + "@users.fitlog.local";
	}

	private static String resolveNickname(KakaoUserInfoResponse userInfo, String providerUserId) {
		KakaoAccount account = userInfo.kakaoAccount();
		if (account != null && account.profile() != null && hasText(account.profile().nickname())) {
			return account.profile().nickname().trim();
		}

		Map<String, String> properties = userInfo.properties();
		if (properties != null && hasText(properties.get("nickname"))) {
			return properties.get("nickname").trim();
		}

		return "Kakao User " + providerUserId;
	}

	private static boolean hasText(String value) {
		return value != null && !value.isBlank();
	}

	public record KakaoUser(
		String providerUserId,
		String email,
		String nickname
	) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	private record KakaoTokenResponse(
		@JsonProperty("access_token") String accessToken
	) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	private record KakaoUserInfoResponse(
		Long id,
		Map<String, String> properties,
		@JsonProperty("kakao_account") KakaoAccount kakaoAccount
	) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	private record KakaoAccount(
		String email,
		KakaoProfile profile,
		@JsonProperty("is_email_valid") Boolean isEmailValid,
		@JsonProperty("is_email_verified") Boolean isEmailVerified
	) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	private record KakaoProfile(
		String nickname
	) {
	}
}
