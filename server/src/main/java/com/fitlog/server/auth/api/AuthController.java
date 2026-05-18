package com.fitlog.server.auth.api;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fitlog.server.auth.application.AuthService;
import com.fitlog.server.auth.application.GoogleOAuthException;
import com.fitlog.server.auth.application.GoogleOAuthService;
import com.fitlog.server.auth.application.KakaoOAuthException;
import com.fitlog.server.auth.application.KakaoOAuthService;
import com.fitlog.server.user.domain.SocialType;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;
	private final KakaoOAuthService kakaoOAuthService;
	private final GoogleOAuthService googleOAuthService;

	public AuthController(
		AuthService authService,
		KakaoOAuthService kakaoOAuthService,
		GoogleOAuthService googleOAuthService
	) {
		this.authService = authService;
		this.kakaoOAuthService = kakaoOAuthService;
		this.googleOAuthService = googleOAuthService;
	}

	@PostMapping("/login")
	public ResponseEntity<AuthService.AuthResponse> login(@Valid @RequestBody SocialLoginRequest request) {
		try {
			return ResponseEntity.ok(this.authService.login(new AuthService.SocialLoginCommand(
				request.socialType(),
				request.providerUserId().trim(),
				request.email().trim(),
				request.nickname().trim()
			)));
		}
		catch (IllegalArgumentException exception) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
	}

	@GetMapping("/kakao/authorize-url")
	public KakaoAuthorizeUrlResponse kakaoAuthorizeUrl() {
		return new KakaoAuthorizeUrlResponse(this.kakaoOAuthService.getAuthorizationUrl());
	}

	@PostMapping("/kakao/callback")
	public ResponseEntity<AuthService.AuthResponse> kakaoCallback(@Valid @RequestBody KakaoCallbackRequest request) {
		try {
			return ResponseEntity.ok(this.kakaoOAuthService.login(request.code()));
		}
		catch (KakaoOAuthException | IllegalArgumentException exception) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
	}

	@GetMapping("/google/authorize-url")
	public GoogleAuthorizeUrlResponse googleAuthorizeUrl() {
		return new GoogleAuthorizeUrlResponse(this.googleOAuthService.getAuthorizationUrl());
	}

	@PostMapping("/google/callback")
	public ResponseEntity<AuthService.AuthResponse> googleCallback(@Valid @RequestBody GoogleCallbackRequest request) {
		try {
			return ResponseEntity.ok(this.googleOAuthService.login(request.code()));
		}
		catch (GoogleOAuthException | IllegalArgumentException exception) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
	}

	@GetMapping("/me")
	public ResponseEntity<AuthService.AuthUserResponse> me(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader
	) {
		try {
			return ResponseEntity.ok(this.authService.getCurrentUser(extractBearerToken(authorizationHeader)));
		}
		catch (IllegalArgumentException exception) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
	}

	@PostMapping("/logout")
	public Map<String, Boolean> logout() {
		return Map.of("ok", true);
	}

	private static String extractBearerToken(String authorizationHeader) {
		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
			throw new IllegalArgumentException("Missing bearer token");
		}

		return authorizationHeader.substring("Bearer ".length());
	}

	public record SocialLoginRequest(
		@NotNull SocialType socialType,
		@NotBlank String providerUserId,
		@NotBlank @Email String email,
		@NotBlank String nickname
	) {
	}

	public record KakaoAuthorizeUrlResponse(String authorizationUrl) {
	}

	public record KakaoCallbackRequest(@NotBlank String code) {
	}

	public record GoogleAuthorizeUrlResponse(String authorizationUrl) {
	}

	public record GoogleCallbackRequest(@NotBlank String code) {
	}
}
