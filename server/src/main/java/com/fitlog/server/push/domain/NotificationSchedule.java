package com.fitlog.server.push.domain;

import java.time.LocalDateTime;

import com.fitlog.server.common.entity.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
	name = "notification_schedule",
	indexes = {
		@Index(name = "idx_notification_schedule_user_id", columnList = "user_id"),
		@Index(name = "idx_notification_schedule_due", columnList = "status, scheduled_at")
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NotificationSchedule extends BaseTimeEntity {

	private static final int MAX_RETRY_COUNT = 3;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "title", nullable = false, length = 120)
	private String title;

	@Column(name = "body", nullable = false, length = 500)
	private String body;

	@Column(name = "target_url", nullable = false, length = 500)
	private String targetUrl;

	@Column(name = "scheduled_at", nullable = false)
	private LocalDateTime scheduledAt;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false, length = 20)
	private NotificationScheduleStatus status = NotificationScheduleStatus.PENDING;

	@Column(name = "sent_at")
	private LocalDateTime sentAt;

	@Column(name = "read_at")
	private LocalDateTime readAt;

	@Column(name = "retry_count", nullable = false)
	private int retryCount;

	private NotificationSchedule(Long userId, String title, String body, String targetUrl, LocalDateTime scheduledAt) {
		this.userId = userId;
		this.title = title;
		this.body = body;
		this.targetUrl = targetUrl;
		this.scheduledAt = scheduledAt;
		this.status = NotificationScheduleStatus.PENDING;
		this.retryCount = 0;
	}

	public static NotificationSchedule create(
		Long userId,
		String title,
		String body,
		String targetUrl,
		LocalDateTime scheduledAt
	) {
		return new NotificationSchedule(userId, title, body, targetUrl, scheduledAt);
	}

	public void markSent(LocalDateTime sentAt) {
		this.status = NotificationScheduleStatus.SENT;
		this.sentAt = sentAt;
	}

	public void markRead(LocalDateTime readAt) {
		if (this.status == NotificationScheduleStatus.SENT && this.readAt == null) {
			this.readAt = readAt;
		}
	}

	public void markFailed() {
		this.retryCount += 1;
		if (this.retryCount >= MAX_RETRY_COUNT) {
			this.status = NotificationScheduleStatus.FAILED;
		}
	}

	public void cancel() {
		if (this.status != NotificationScheduleStatus.PENDING) {
			throw new IllegalStateException("Only pending schedules can be cancelled");
		}

		this.status = NotificationScheduleStatus.CANCELLED;
	}
}
