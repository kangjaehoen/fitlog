package com.fitlog.server.auth.application;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthTokenService {

	private static final String HMAC_ALGORITHM = "HmacSHA256";

	private final SecretKeySpec secretKeySpec;
	private final Duration tokenValidity;

	public AuthTokenService(
		@Value("${app.auth.token-secret:fitlog-local-dev-secret}") String tokenSecret,
		@Value("${app.auth.token-validity-hours:168}") long tokenValidityHours
	) {
		this.secretKeySpec = new SecretKeySpec(tokenSecret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
		this.tokenValidity = Duration.ofHours(tokenValidityHours);
	}

	public IssuedToken issue(Long userId) {
		Instant issuedAt = Instant.now();
		String payload = userId + ":" + issuedAt.getEpochSecond();
		String encodedPayload = encode(payload.getBytes(StandardCharsets.UTF_8));
		String signature = sign(encodedPayload);

		return new IssuedToken(encodedPayload + "." + signature, issuedAt.plus(this.tokenValidity));
	}

	public Long parseUserId(String token) {
		String[] parts = token == null ? new String[0] : token.split("\\.", 2);
		if (parts.length != 2 || !signatureMatches(parts[0], parts[1])) {
			throw new IllegalArgumentException("Invalid auth token");
		}

		String payload = new String(decode(parts[0]), StandardCharsets.UTF_8);
		String[] payloadParts = payload.split(":", 2);
		if (payloadParts.length != 2) {
			throw new IllegalArgumentException("Invalid auth token payload");
		}

		long issuedAtEpochSecond = Long.parseLong(payloadParts[1]);
		if (Instant.ofEpochSecond(issuedAtEpochSecond).plus(this.tokenValidity).isBefore(Instant.now())) {
			throw new IllegalArgumentException("Expired auth token");
		}

		return Long.parseLong(payloadParts[0]);
	}

	private boolean signatureMatches(String encodedPayload, String signature) {
		return MessageDigest.isEqual(sign(encodedPayload).getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8));
	}

	private String sign(String encodedPayload) {
		try {
			Mac mac = Mac.getInstance(HMAC_ALGORITHM);
			mac.init(this.secretKeySpec);
			return encode(mac.doFinal(encodedPayload.getBytes(StandardCharsets.UTF_8)));
		}
		catch (Exception exception) {
			throw new IllegalStateException("Could not sign auth token", exception);
		}
	}

	private static String encode(byte[] bytes) {
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	private static byte[] decode(String value) {
		return Base64.getUrlDecoder().decode(value);
	}

	public record IssuedToken(String value, Instant expiresAt) {
	}
}
