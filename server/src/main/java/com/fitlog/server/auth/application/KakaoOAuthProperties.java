package com.fitlog.server.auth.application;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.oauth.kakao")
public record KakaoOAuthProperties(
	String clientId,
	String clientSecret,
	String redirectUri
) {

	public boolean isConfigured() {
		return hasText(this.clientId) && hasText(this.redirectUri);
	}

	private static boolean hasText(String value) {
		return value != null && !value.isBlank();
	}
}
