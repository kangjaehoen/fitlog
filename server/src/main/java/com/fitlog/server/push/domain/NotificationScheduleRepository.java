package com.fitlog.server.push.domain;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationScheduleRepository extends JpaRepository<NotificationSchedule, Long> {

	List<NotificationSchedule> findByUserIdOrderByScheduledAtDesc(Long userId);

	List<NotificationSchedule> findByUserIdAndStatusOrderByScheduledAtDesc(
		Long userId,
		NotificationScheduleStatus status
	);

	List<NotificationSchedule> findTop50ByStatusAndScheduledAtLessThanEqualOrderByScheduledAtAsc(
		NotificationScheduleStatus status,
		LocalDateTime scheduledAt
	);
}
