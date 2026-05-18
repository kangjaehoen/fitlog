package com.fitlog.server.account.application;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.upload.profile-images")
public record ProfileImageStorageProperties(
	String storagePath,
	String publicPath,
	long maxBytes
) {

	public ProfileImageStorageProperties {
		storagePath = hasText(storagePath) ? storagePath : "uploads/profile-images";
		publicPath = hasText(publicPath) ? publicPath : "/uploads/profile-images";
		maxBytes = maxBytes > 0 ? maxBytes : 5 * 1024 * 1024;
	}

	private static boolean hasText(String value) {
		return value != null && !value.isBlank();
	}
}
