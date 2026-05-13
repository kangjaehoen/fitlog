package com.fitlog.server.push.application;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fitlog.server.push.config.WebPushProperties;
import com.fitlog.server.push.domain.PushSubscription;
import com.fitlog.server.push.domain.PushSubscriptionRepository;

@Service
public class PushSubscriptionService {

	private final PushAuthService pushAuthService;
	private final PushSubscriptionRepository pushSubscriptionRepository;
	private final WebPushProperties webPushProperties;

	public PushSubscriptionService(
		PushAuthService pushAuthService,
		PushSubscriptionRepository pushSubscriptionRepository,
		WebPushProperties webPushProperties
	) {
		this.pushAuthService = pushAuthService;
		this.pushSubscriptionRepository = pushSubscriptionRepository;
		this.webPushProperties = webPushProperties;
	}

	public VapidPublicKeyResponse getVapidPublicKey() {
		String publicKey = this.webPushProperties.vapid().publicKey();
		if (publicKey == null || publicKey.isBlank()) {
			throw new IllegalStateException("VAPID public key is not configured");
		}

		return new VapidPublicKeyResponse(publicKey);
	}

	@Transactional
	public void save(String tokenValue, SavePushSubscriptionCommand command) {
		Long userId = this.pushAuthService.requireUserId(tokenValue);
		PushSubscription subscription = this.pushSubscriptionRepository.findByEndpoint(command.endpoint())
			.orElseGet(() -> PushSubscription.create(
				userId,
				command.endpoint(),
				command.p256dh(),
				command.auth(),
				command.userAgent()
			));

		subscription.update(userId, command.p256dh(), command.auth(), command.userAgent());
		this.pushSubscriptionRepository.save(subscription);
	}

	@Transactional
	public void delete(String tokenValue, String endpoint) {
		Long userId = this.pushAuthService.requireUserId(tokenValue);
		this.pushSubscriptionRepository.deleteByUserIdAndEndpoint(userId, endpoint);
	}

	public record SavePushSubscriptionCommand(
		String endpoint,
		String p256dh,
		String auth,
		String userAgent
	) {
	}

	public record VapidPublicKeyResponse(String publicKey) {
	}
}
