package com.fitlog.server.auth.application;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fitlog.server.user.domain.SocialType;

@Service
public class KakaoOAuthService {

	private final KakaoOAuthClient kakaoOAuthClient;
	private final AuthService authService;

	public KakaoOAuthService(KakaoOAuthClient kakaoOAuthClient, AuthService authService) {
		this.kakaoOAuthClient = kakaoOAuthClient;
		this.authService = authService;
	}

	public String getAuthorizationUrl() {
		return this.kakaoOAuthClient.buildAuthorizationUrl();
	}

	@Transactional
	public AuthService.AuthResponse login(String authorizationCode) {
		KakaoOAuthClient.KakaoUser kakaoUser = this.kakaoOAuthClient.fetchUser(authorizationCode.trim());

		return this.authService.login(new AuthService.SocialLoginCommand(
			SocialType.KAKAO,
			kakaoUser.providerUserId(),
			kakaoUser.email(),
			kakaoUser.nickname()
		));
	}
}
