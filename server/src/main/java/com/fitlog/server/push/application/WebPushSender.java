package com.fitlog.server.push.application;

import java.security.Security;

import org.apache.http.HttpResponse;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitlog.server.push.config.WebPushProperties;
import com.fitlog.server.push.domain.NotificationSchedule;
import com.fitlog.server.push.domain.PushSubscription;

import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;

@Component
public class WebPushSender {

	private static final String BOUNCY_CASTLE_PROVIDER = "BC";

	private final ObjectMapper objectMapper;
	private final WebPushProperties webPushProperties;

	public WebPushSender(ObjectMapper objectMapper, WebPushProperties webPushProperties) {
		this.objectMapper = objectMapper;
		this.webPushProperties = webPushProperties;
		if (Security.getProvider(BOUNCY_CASTLE_PROVIDER) == null) {
			Security.addProvider(new BouncyCastleProvider());
		}
	}

	public SendResult send(NotificationSchedule schedule, PushSubscription pushSubscription) {
		if (!this.webPushProperties.hasVapidKeys()) {
			return SendResult.failed(false);
		}

		try {
			PushService pushService = new PushService(
				this.webPushProperties.vapid().publicKey(),
				this.webPushProperties.vapid().privateKey(),
				this.webPushProperties.vapid().subject()
			);
			Subscription subscription = new Subscription(
				pushSubscription.getEndpoint(),
				new Subscription.Keys(pushSubscription.getP256dh(), pushSubscription.getAuth())
			);
			Notification notification = new Notification(subscription, toPayload(schedule));
			HttpResponse response = pushService.send(notification);
			int statusCode = response.getStatusLine().getStatusCode();

			if (statusCode >= 200 && statusCode < 300) {
				return SendResult.success();
			}

			return SendResult.failed(statusCode == 404 || statusCode == 410);
		}
		catch (Exception exception) {
			return SendResult.failed(isExpiredSubscriptionException(exception));
		}
	}

	private String toPayload(NotificationSchedule schedule) throws JsonProcessingException {
		return this.objectMapper.writeValueAsString(new PushPayload(
			schedule.getTitle(),
			schedule.getBody(),
			schedule.getTargetUrl()
		));
	}

	private static boolean isExpiredSubscriptionException(Exception exception) {
		String message = exception.getMessage();
		return message != null && (message.contains("404") || message.contains("410"));
	}

	public record SendResult(boolean sent, boolean expiredSubscription) {

		private static SendResult success() {
			return new SendResult(true, false);
		}

		private static SendResult failed(boolean expiredSubscription) {
			return new SendResult(false, expiredSubscription);
		}
	}

	private record PushPayload(String title, String body, String url) {
	}
}
