package com.fitlog.server.account.api;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.fitlog.server.account.application.AccountService;

@RestController
@RequestMapping("/api/account")
public class AccountController {

	private final AccountService accountService;

	public AccountController(AccountService accountService) {
		this.accountService = accountService;
	}

	@PostMapping("/withdraw")
	public Map<String, Boolean> withdraw(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader
	) {
		try {
			this.accountService.withdraw(extractBearerToken(authorizationHeader));
			return Map.of("ok", true);
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
		}
	}

	@PostMapping(value = "/profile/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public AccountService.ProfileImageResponse uploadProfileImage(
		@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
		@RequestPart("image") MultipartFile image
	) {
		try {
			return this.accountService.uploadProfileImage(extractBearerToken(authorizationHeader), image);
		}
		catch (AccountService.InvalidProfileImageException exception) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
		}
	}

	private static String extractBearerToken(String authorizationHeader) {
		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
			throw new IllegalArgumentException("Missing bearer token");
		}

		return authorizationHeader.substring("Bearer ".length());
	}
}
