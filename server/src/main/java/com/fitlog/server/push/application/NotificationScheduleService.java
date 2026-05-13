package com.fitlog.server.push.application;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fitlog.server.push.domain.NotificationSchedule;
import com.fitlog.server.push.domain.NotificationScheduleRepository;
import com.fitlog.server.push.domain.NotificationScheduleStatus;

@Service
public class NotificationScheduleService {

	private static final String DEFAULT_TARGET_URL = "/notifications";

	private final PushAuthService pushAuthService;
	private final NotificationScheduleRepository notificationScheduleRepository;

	public NotificationScheduleService(
		PushAuthService pushAuthService,
		NotificationScheduleRepository notificationScheduleRepository
	) {
		this.pushAuthService = pushAuthService;
		this.notificationScheduleRepository = notificationScheduleRepository;
	}

	@Transactional
	public NotificationScheduleResponse create(String tokenValue, CreateNotificationScheduleCommand command) {
		Long userId = this.pushAuthService.requireUserId(tokenValue);
		if (command.scheduledAt().isBefore(LocalDateTime.now())) {
			throw new IllegalArgumentException("Scheduled time must be in the future");
		}

		NotificationSchedule schedule = NotificationSchedule.create(
			userId,
			command.title().trim(),
			command.body().trim(),
			normalizeTargetUrl(command.targetUrl()),
			command.scheduledAt()
		);

		return NotificationScheduleResponse.from(this.notificationScheduleRepository.save(schedule));
	}

	@Transactional(readOnly = true)
	public List<NotificationScheduleResponse> findAll(String tokenValue, NotificationScheduleStatus status) {
		Long userId = this.pushAuthService.requireUserId(tokenValue);
		List<NotificationSchedule> schedules = status == null
			? this.notificationScheduleRepository.findByUserIdOrderByScheduledAtDesc(userId)
			: this.notificationScheduleRepository.findByUserIdAndStatusOrderByScheduledAtDesc(userId, status);

		return schedules.stream().map(NotificationScheduleResponse::from).toList();
	}

	@Transactional(readOnly = true)
	public NotificationScheduleResponse findOne(String tokenValue, Long scheduleId) {
		Long userId = this.pushAuthService.requireUserId(tokenValue);
		NotificationSchedule schedule = findOwnedSchedule(userId, scheduleId);

		return NotificationScheduleResponse.from(schedule);
	}

	@Transactional
	public NotificationScheduleResponse markRead(String tokenValue, Long scheduleId) {
		Long userId = this.pushAuthService.requireUserId(tokenValue);
		NotificationSchedule schedule = findOwnedSchedule(userId, scheduleId);

		schedule.markRead(LocalDateTime.now());
		return NotificationScheduleResponse.from(schedule);
	}

	@Transactional
	public NotificationScheduleResponse cancel(String tokenValue, Long scheduleId) {
		Long userId = this.pushAuthService.requireUserId(tokenValue);
		NotificationSchedule schedule = findOwnedSchedule(userId, scheduleId);

		schedule.cancel();
		return NotificationScheduleResponse.from(schedule);
	}

	private NotificationSchedule findOwnedSchedule(Long userId, Long scheduleId) {
		return this.notificationScheduleRepository.findById(scheduleId)
			.filter(candidate -> candidate.getUserId().equals(userId))
			.orElseThrow(() -> new IllegalArgumentException("Notification schedule not found"));
	}

	private static String normalizeTargetUrl(String targetUrl) {
		if (targetUrl == null || targetUrl.isBlank()) {
			return DEFAULT_TARGET_URL;
		}

		return targetUrl.trim();
	}

	public record CreateNotificationScheduleCommand(
		String title,
		String body,
		LocalDateTime scheduledAt,
		String targetUrl
	) {
	}

	public record NotificationScheduleResponse(
		Long id,
		String title,
		String body,
		String targetUrl,
		LocalDateTime scheduledAt,
		NotificationScheduleStatus status,
		LocalDateTime sentAt,
		LocalDateTime readAt,
		int retryCount
	) {

		private static NotificationScheduleResponse from(NotificationSchedule schedule) {
			return new NotificationScheduleResponse(
				schedule.getId(),
				schedule.getTitle(),
				schedule.getBody(),
				schedule.getTargetUrl(),
				schedule.getScheduledAt(),
				schedule.getStatus(),
				schedule.getSentAt(),
				schedule.getReadAt(),
				schedule.getRetryCount()
			);
		}
	}
}
