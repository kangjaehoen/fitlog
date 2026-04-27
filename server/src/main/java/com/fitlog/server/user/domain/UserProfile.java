package com.fitlog.server.user.domain;

import java.math.BigDecimal;

import com.fitlog.server.common.entity.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
	name = "user_profiles",
	uniqueConstraints = {
		@UniqueConstraint(name = "uk_user_profiles_user", columnNames = "user_id")
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserProfile extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "nickname", nullable = false, length = 40)
	private String nickname;

	@Column(name = "height_cm", precision = 5, scale = 2)
	private BigDecimal heightCm;

	@Column(name = "profile_image_url", length = 255)
	private String profileImageUrl;

	private UserProfile(Long userId, String nickname) {
		this.userId = userId;
		this.nickname = nickname;
	}

	public static UserProfile create(Long userId, String nickname) {
		return new UserProfile(userId, nickname);
	}
}
