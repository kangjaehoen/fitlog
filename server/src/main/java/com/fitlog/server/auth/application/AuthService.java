package com.fitlog.server.auth.application;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fitlog.server.goal.domain.Goal;
import com.fitlog.server.goal.domain.GoalRepository;
import com.fitlog.server.user.domain.SocialType;
import com.fitlog.server.user.domain.User;
import com.fitlog.server.user.domain.UserProfile;
import com.fitlog.server.user.domain.UserProfileRepository;
import com.fitlog.server.user.domain.UserRepository;

@Service
public class AuthService {

	private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

	private final UserRepository userRepository;
	private final UserProfileRepository userProfileRepository;
	private final GoalRepository goalRepository;
	private final AuthTokenService authTokenService;

	public AuthService(
		UserRepository userRepository,
		UserProfileRepository userProfileRepository,
		GoalRepository goalRepository,
		AuthTokenService authTokenService
	) {
		this.userRepository = userRepository;
		this.userProfileRepository = userProfileRepository;
		this.goalRepository = goalRepository;
		this.authTokenService = authTokenService;
	}

	@Transactional
	public AuthResponse login(SocialLoginCommand command) {
		User user = this.userRepository
			.findBySocialTypeAndProviderUserId(command.socialType(), command.providerUserId())
			.or(() -> this.userRepository.findByEmailAndSocialType(command.email(), command.socialType()))
			.orElseGet(() -> this.userRepository.save(
				User.createSocialUser(command.email(), command.socialType(), command.providerUserId())
			));
		if (!user.isActive()) {
			throw new IllegalArgumentException("User is not active");
		}

		UserProfile profile = this.userProfileRepository
			.findByUserId(user.getId())
			.orElseGet(() -> this.userProfileRepository.save(UserProfile.create(user.getId(), command.nickname())));
		this.goalRepository.findFirstByUserIdAndActiveTrueOrderByIdDesc(user.getId())
			.orElseGet(() -> this.goalRepository.save(Goal.createDefault(user.getId(), LocalDate.now(SEOUL))));

		AuthTokenService.IssuedToken token = this.authTokenService.issue(user.getId());

		return new AuthResponse(
			token.value(),
			token.expiresAt(),
			new AuthUserResponse(user.getId(), user.getEmail(), user.getSocialType(), profile.getNickname())
		);
	}

	@Transactional(readOnly = true)
	public AuthUserResponse getCurrentUser(String tokenValue) {
		Long userId = this.authTokenService.parseUserId(tokenValue);
		User user = this.userRepository.findById(userId)
			.orElseThrow(() -> new IllegalArgumentException("User not found"));
		String nickname = this.userProfileRepository.findByUserId(userId)
			.map(UserProfile::getNickname)
			.orElse(user.getEmail());

		return new AuthUserResponse(user.getId(), user.getEmail(), user.getSocialType(), nickname);
	}

	public record SocialLoginCommand(
		SocialType socialType,
		String providerUserId,
		String email,
		String nickname
	) {
	}

	public record AuthResponse(
		String token,
		Instant expiresAt,
		AuthUserResponse user
	) {
	}

	public record AuthUserResponse(
		Long id,
		String email,
		SocialType socialType,
		String nickname
	) {
	}
}
