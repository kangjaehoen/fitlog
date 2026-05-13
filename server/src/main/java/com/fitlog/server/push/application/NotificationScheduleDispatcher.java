package com.fitlog.server.push.application;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fitlog.server.push.domain.NotificationSchedule;
import com.fitlog.server.push.domain.NotificationScheduleRepository;
import com.fitlog.server.push.domain.NotificationScheduleStatus;
import com.fitlog.server.push.domain.PushSubscription;
import com.fitlog.server.push.domain.PushSubscriptionRepository;

@Service
public class NotificationScheduleDispatcher {

	private final NotificationScheduleRepository notificationScheduleRepository;
	private final PushSubscriptionRepository pushSubscriptionRepository;
	private final WebPushSender webPushSender;

	public NotificationScheduleDispatcher(
		NotificationScheduleRepository notificationScheduleRepository,
		PushSubscriptionRepository pushSubscriptionRepository,
		WebPushSender webPushSender
	) {
		this.notificationScheduleRepository = notificationScheduleRepository;
		this.pushSubscriptionRepository = pushSubscriptionRepository;
		this.webPushSender = webPushSender;
	}

	@Transactional
	public int dispatchDueSchedules() {
		List<NotificationSchedule> schedules =
			this.notificationScheduleRepository.findTop50ByStatusAndScheduledAtLessThanEqualOrderByScheduledAtAsc(
				NotificationScheduleStatus.PENDING,
				LocalDateTime.now()
			);

		int sentCount = 0;
		for (NotificationSchedule schedule : schedules) {
			if (dispatch(schedule)) {
				sentCount += 1;
			}
		}

		return sentCount;
	}

	private boolean dispatch(NotificationSchedule schedule) {
		List<PushSubscription> subscriptions = this.pushSubscriptionRepository.findByUserId(schedule.getUserId());
		if (subscriptions.isEmpty()) {
			schedule.markFailed();
			return false;
		}

		boolean hasSent = false;
		for (PushSubscription subscription : subscriptions) {
			WebPushSender.SendResult result = this.webPushSender.send(schedule, subscription);
			if (result.sent()) {
				hasSent = true;
			}
			if (result.expiredSubscription()) {
				this.pushSubscriptionRepository.deleteByEndpoint(subscription.getEndpoint());
			}
		}

		if (hasSent) {
			schedule.markSent(LocalDateTime.now());
			return true;
		}

		schedule.markFailed();
		return false;
	}
}
