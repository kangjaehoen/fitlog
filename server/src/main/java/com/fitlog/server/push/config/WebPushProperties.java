package com.fitlog.server.push.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "webpush")
public record WebPushProperties(
	Vapid vapid,
	Scheduler scheduler
) {

	public WebPushProperties {
		if (vapid == null) {
			vapid = new Vapid("", "", "mailto:admin@example.com");
		}
		if (scheduler == null) {
			scheduler = new Scheduler(true, 60_000L);
		}
	}

	public boolean hasVapidKeys() {
		return hasText(this.vapid.publicKey()) && hasText(this.vapid.privateKey());
	}

	private static boolean hasText(String value) {
		return value != null && !value.isBlank();
	}

	public record Vapid(
		String publicKey,
		String privateKey,
		String subject
	) {
	}

	public record Scheduler(
		boolean enabled,
		long fixedDelayMs
	) {
	}
}
