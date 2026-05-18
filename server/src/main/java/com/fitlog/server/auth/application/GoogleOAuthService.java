package com.fitlog.server.auth.application;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fitlog.server.user.domain.SocialType;

@Service
public class GoogleOAuthService {

	private final GoogleOAuthClient googleOAuthClient;
	private final AuthService authService;

	public GoogleOAuthService(GoogleOAuthClient googleOAuthClient, AuthService authService) {
		this.googleOAuthClient = googleOAuthClient;
		this.authService = authService;
	}

	public String getAuthorizationUrl() {
		return this.googleOAuthClient.buildAuthorizationUrl();
	}

	@Transactional
	public AuthService.AuthResponse login(String authorizationCode) {
		GoogleOAuthClient.GoogleUser googleUser = this.googleOAuthClient.fetchUser(authorizationCode.trim());

		return this.authService.login(new AuthService.SocialLoginCommand(
			SocialType.GOOGLE,
			googleUser.providerUserId(),
			googleUser.email(),
			googleUser.nickname()
		));
	}
}
