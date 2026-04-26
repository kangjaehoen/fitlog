package com.fitlog.server.user.domain;

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
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
	name = "users",
	indexes = {
		@Index(name = "idx_users_status", columnList = "status"),
		@Index(name = "idx_users_provider", columnList = "provider")
	},
	uniqueConstraints = {
		@UniqueConstraint(name = "uk_users_email_provider", columnNames = {"email", "provider"}),
		@UniqueConstraint(name = "uk_users_provider_user_id", columnNames = {"provider", "provider_user_id"})
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "email", nullable = false, length = 120)
	private String email;

	@Enumerated(EnumType.STRING)
	@Column(name = "provider", nullable = false, length = 20)
	private SocialType socialType;

	@Column(name = "provider_user_id", nullable = false, length = 100)
	private String providerUserId;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false, length = 20)
	private UserStatus status = UserStatus.ACTIVE;
}
