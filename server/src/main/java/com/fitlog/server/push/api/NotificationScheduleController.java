package com.fitlog.server.push.api;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.fitlog.server.push.application.NotificationScheduleService;
import com.fitlog.server.push.domain.NotificationScheduleStatus;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/notifications/schedules")
public class NotificationScheduleController {

	private final NotificationScheduleService notificationScheduleService;

	public NotificationScheduleController(NotificationScheduleService notificationScheduleService) {
		this.notificationScheduleService = notificationScheduleService;
	}

	@PostMapping
	public NotificationScheduleService.NotificationScheduleResponse create(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
		@Valid @RequestBody CreateNotificationScheduleRequest request
	) {
		try {
			return this.notificationScheduleService.create(extractBearerToken(authorizationHeader), request.toCommand());
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
		}
	}

	@GetMapping
	public List<NotificationScheduleService.NotificationScheduleResponse> findAll(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
		@RequestParam(value = "status", required = false) NotificationScheduleStatus status
	) {
		try {
			return this.notificationScheduleService.findAll(extractBearerToken(authorizationHeader), status);
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
		}
	}

	@GetMapping("/{id}")
	public NotificationScheduleService.NotificationScheduleResponse findOne(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
		@PathVariable Long id
	) {
		try {
			return this.notificationScheduleService.findOne(extractBearerToken(authorizationHeader), id);
		}
		catch (IllegalArgumentException exception) {
			throw toScheduleResponseException(exception);
		}
	}

	@PatchMapping("/{id}/read")
	public NotificationScheduleService.NotificationScheduleResponse markRead(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
		@PathVariable Long id
	) {
		try {
			return this.notificationScheduleService.markRead(extractBearerToken(authorizationHeader), id);
		}
		catch (IllegalArgumentException exception) {
			throw toScheduleResponseException(exception);
		}
	}

	@PatchMapping("/{id}/cancel")
	public NotificationScheduleService.NotificationScheduleResponse cancel(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
		@PathVariable Long id
	) {
		try {
			return this.notificationScheduleService.cancel(extractBearerToken(authorizationHeader), id);
		}
		catch (IllegalStateException exception) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, exception.getMessage());
		}
		catch (IllegalArgumentException exception) {
			throw toScheduleResponseException(exception);
		}
	}

	private static String extractBearerToken(String authorizationHeader) {
		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
			throw new IllegalArgumentException("Missing bearer token");
		}

		return authorizationHeader.substring("Bearer ".length());
	}

	private static ResponseStatusException toScheduleResponseException(IllegalArgumentException exception) {
		if ("Notification schedule not found".equals(exception.getMessage())) {
			return new ResponseStatusException(HttpStatus.NOT_FOUND, exception.getMessage());
		}

		return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
	}

	public record CreateNotificationScheduleRequest(
		@NotBlank @Size(max = 120) String title,
		@NotBlank @Size(max = 500) String body,
		@NotNull @Future LocalDateTime scheduledAt,
		@Size(max = 500) String targetUrl
	) {

		private NotificationScheduleService.CreateNotificationScheduleCommand toCommand() {
			return new NotificationScheduleService.CreateNotificationScheduleCommand(
				this.title,
				this.body,
				this.scheduledAt,
				this.targetUrl
			);
		}
	}
}
