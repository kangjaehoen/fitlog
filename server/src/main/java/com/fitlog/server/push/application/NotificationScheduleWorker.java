package com.fitlog.server.push.application;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.fitlog.server.push.config.WebPushProperties;

@Component
public class NotificationScheduleWorker {

	private final NotificationScheduleDispatcher notificationScheduleDispatcher;
	private final WebPushProperties webPushProperties;

	public NotificationScheduleWorker(
		NotificationScheduleDispatcher notificationScheduleDispatcher,
		WebPushProperties webPushProperties
	) {
		this.notificationScheduleDispatcher = notificationScheduleDispatcher;
		this.webPushProperties = webPushProperties;
	}

	@Scheduled(fixedDelayString = "${webpush.scheduler.fixed-delay-ms:60000}")
	public void dispatchDueSchedules() {
		if (!this.webPushProperties.scheduler().enabled()) {
			return;
		}

		this.notificationScheduleDispatcher.dispatchDueSchedules();
	}
}
