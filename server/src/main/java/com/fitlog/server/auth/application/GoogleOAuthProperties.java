package com.fitlog.server.auth.application;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.oauth.google")
public record GoogleOAuthProperties(
	String clientId,
	String clientSecret,
	String redirectUri
) {

	public boolean isConfigured() {
		return hasText(this.clientId) && hasText(this.clientSecret) && hasText(this.redirectUri);
	}

	private static boolean hasText(String value) {
		return value != null && !value.isBlank();
	}
}
