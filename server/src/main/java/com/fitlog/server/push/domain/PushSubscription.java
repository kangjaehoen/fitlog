package com.fitlog.server.push.domain;

import com.fitlog.server.common.entity.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
	name = "push_subscription",
	indexes = {
		@Index(name = "idx_push_subscription_user_id", columnList = "user_id")
	},
	uniqueConstraints = {
		@UniqueConstraint(name = "uk_push_subscription_endpoint", columnNames = "endpoint")
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PushSubscription extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "endpoint", nullable = false, length = 1024)
	private String endpoint;

	@Column(name = "p256dh", nullable = false, length = 255)
	private String p256dh;

	@Column(name = "auth", nullable = false, length = 255)
	private String auth;

	@Column(name = "user_agent", length = 512)
	private String userAgent;

	private PushSubscription(Long userId, String endpoint, String p256dh, String auth, String userAgent) {
		this.userId = userId;
		this.endpoint = endpoint;
		this.p256dh = p256dh;
		this.auth = auth;
		this.userAgent = userAgent;
	}

	public static PushSubscription create(Long userId, String endpoint, String p256dh, String auth, String userAgent) {
		return new PushSubscription(userId, endpoint, p256dh, auth, userAgent);
	}

	public void update(Long userId, String p256dh, String auth, String userAgent) {
		this.userId = userId;
		this.p256dh = p256dh;
		this.auth = auth;
		this.userAgent = userAgent;
	}
}
