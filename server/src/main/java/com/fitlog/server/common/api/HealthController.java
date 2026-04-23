package com.fitlog.server.common.api;

import java.time.OffsetDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

	private final String applicationName;

	public HealthController(@Value("${spring.application.name}") String applicationName) {
		this.applicationName = applicationName;
	}

	@GetMapping("/health")
	public Map<String, Object> health() {
		return Map.of(
			"status", "UP",
			"service", this.applicationName,
			"timestamp", OffsetDateTime.now().toString()
		);
	}
}
