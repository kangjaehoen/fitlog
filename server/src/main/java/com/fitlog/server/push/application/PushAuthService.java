package com.fitlog.server.push.application;

import org.springframework.stereotype.Service;

import com.fitlog.server.auth.application.AuthTokenService;
import com.fitlog.server.user.domain.UserRepository;

@Service
public class PushAuthService {

	private final AuthTokenService authTokenService;
	private final UserRepository userRepository;

	public PushAuthService(AuthTokenService authTokenService, UserRepository userRepository) {
		this.authTokenService = authTokenService;
		this.userRepository = userRepository;
	}

	public Long requireUserId(String tokenValue) {
		Long userId = this.authTokenService.parseUserId(tokenValue);
		if (!this.userRepository.existsById(userId)) {
			throw new IllegalArgumentException("User not found");
		}

		return userId;
	}
}
