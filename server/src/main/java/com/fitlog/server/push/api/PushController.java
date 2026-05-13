package com.fitlog.server.push.api;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.fitlog.server.push.application.PushSubscriptionService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/push")
public class PushController {

	private final PushSubscriptionService pushSubscriptionService;

	public PushController(PushSubscriptionService pushSubscriptionService) {
		this.pushSubscriptionService = pushSubscriptionService;
	}

	@GetMapping("/vapid-public-key")
	public PushSubscriptionService.VapidPublicKeyResponse getVapidPublicKey() {
		try {
			return this.pushSubscriptionService.getVapidPublicKey();
		}
		catch (IllegalStateException exception) {
			throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, exception.getMessage());
		}
	}

	@PostMapping("/subscriptions")
	public Map<String, Boolean> saveSubscription(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
		@Valid @RequestBody SavePushSubscriptionRequest request
	) {
		try {
			this.pushSubscriptionService.save(extractBearerToken(authorizationHeader), request.toCommand());
			return Map.of("ok", true);
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
		}
	}

	@DeleteMapping("/subscriptions")
	public Map<String, Boolean> deleteSubscription(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
		@RequestBody(required = false) DeletePushSubscriptionRequest request,
		@RequestParam(value = "endpoint", required = false) String endpoint
	) {
		try {
			String resolvedEndpoint = request != null ? request.endpoint() : endpoint;
			if (resolvedEndpoint == null || resolvedEndpoint.isBlank()) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endpoint is required");
			}

			this.pushSubscriptionService.delete(extractBearerToken(authorizationHeader), resolvedEndpoint);
			return Map.of("ok", true);
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
		}
	}

	private static String extractBearerToken(String authorizationHeader) {
		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
			throw new IllegalArgumentException("Missing bearer token");
		}

		return authorizationHeader.substring("Bearer ".length());
	}

	public record SavePushSubscriptionRequest(
		@NotBlank String endpoint,
		@NotNull PushSubscriptionKeysRequest keys,
		String userAgent
	) {

		private PushSubscriptionService.SavePushSubscriptionCommand toCommand() {
			return new PushSubscriptionService.SavePushSubscriptionCommand(
				this.endpoint.trim(),
				this.keys.p256dh().trim(),
				this.keys.auth().trim(),
				this.userAgent == null ? null : this.userAgent.trim()
			);
		}
	}

	public record PushSubscriptionKeysRequest(
		@NotBlank String p256dh,
		@NotBlank String auth
	) {
	}

	public record DeletePushSubscriptionRequest(@NotBlank String endpoint) {
	}
}
