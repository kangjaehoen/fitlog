package com.fitlog.server.auth.application;

public class KakaoOAuthException extends RuntimeException {

	public KakaoOAuthException(String message) {
		super(message);
	}

	public KakaoOAuthException(String message, Throwable cause) {
		super(message, cause);
	}
}
