package com.fitlog.server.account.application;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fitlog.server.auth.application.AuthTokenService;
import com.fitlog.server.push.domain.NotificationScheduleRepository;
import com.fitlog.server.push.domain.NotificationScheduleStatus;
import com.fitlog.server.user.domain.User;
import com.fitlog.server.user.domain.UserProfile;
import com.fitlog.server.user.domain.UserProfileRepository;
import com.fitlog.server.user.domain.UserRepository;

@Service
public class AccountService {

	private final AuthTokenService authTokenService;
	private final UserRepository userRepository;
	private final UserProfileRepository userProfileRepository;
	private final NotificationScheduleRepository notificationScheduleRepository;
	private final ProfileImageStorageProperties profileImageStorageProperties;

	public AccountService(
		AuthTokenService authTokenService,
		UserRepository userRepository,
		UserProfileRepository userProfileRepository,
		NotificationScheduleRepository notificationScheduleRepository,
		ProfileImageStorageProperties profileImageStorageProperties
	) {
		this.authTokenService = authTokenService;
		this.userRepository = userRepository;
		this.userProfileRepository = userProfileRepository;
		this.notificationScheduleRepository = notificationScheduleRepository;
		this.profileImageStorageProperties = profileImageStorageProperties;
	}

	@Transactional
	public void withdraw(String authToken) {
		Long userId = this.authTokenService.parseUserId(authToken);
		User user = this.userRepository.findById(userId)
			.orElseThrow(() -> new IllegalArgumentException("User not found"));

		user.withdraw();
		this.notificationScheduleRepository
			.findByUserIdAndStatusOrderByScheduledAtDesc(userId, NotificationScheduleStatus.PENDING)
			.forEach(schedule -> schedule.cancel());
	}

	@Transactional
	public ProfileImageResponse uploadProfileImage(String authToken, MultipartFile image) {
		Long userId = this.authTokenService.parseUserId(authToken);
		User user = this.userRepository.findById(userId)
			.orElseThrow(() -> new IllegalArgumentException("User not found"));

		validateProfileImage(image);

		String fileName = "user-%d-%s.%s".formatted(userId, UUID.randomUUID(), extension(image.getContentType()));
		String imageUrl = publicImageUrl(fileName);
		storeImage(image, fileName);

		UserProfile profile = this.userProfileRepository.findByUserId(userId)
			.orElseGet(() -> this.userProfileRepository.save(UserProfile.create(userId, user.getEmail())));
		profile.updateProfileImageUrl(imageUrl);

		return new ProfileImageResponse(imageUrl);
	}

	private void validateProfileImage(MultipartFile image) {
		if (image == null || image.isEmpty()) {
			throw new InvalidProfileImageException("Profile image is required");
		}
		if (image.getSize() > this.profileImageStorageProperties.maxBytes()) {
			throw new InvalidProfileImageException("Profile image is too large");
		}

		String contentType = image.getContentType();
		if (!"image/jpeg".equals(contentType) && !"image/png".equals(contentType) && !"image/webp".equals(contentType)) {
			throw new InvalidProfileImageException("Unsupported profile image type");
		}
	}

	private void storeImage(MultipartFile image, String fileName) {
		Path storageRoot = Paths.get(this.profileImageStorageProperties.storagePath())
			.toAbsolutePath()
			.normalize();
		Path destination = storageRoot.resolve(fileName).normalize();
		if (!destination.startsWith(storageRoot)) {
			throw new InvalidProfileImageException("Invalid profile image path");
		}

		try {
			Files.createDirectories(storageRoot);
			try (InputStream inputStream = image.getInputStream()) {
				Files.copy(inputStream, destination);
			}
		}
		catch (IOException exception) {
			throw new IllegalStateException("Could not store profile image", exception);
		}
	}

	private String publicImageUrl(String fileName) {
		String publicPath = this.profileImageStorageProperties.publicPath();
		String normalizedPublicPath = publicPath.endsWith("/")
			? publicPath.substring(0, publicPath.length() - 1)
			: publicPath;

		return normalizedPublicPath + "/" + fileName;
	}

	private static String extension(String contentType) {
		return switch (contentType == null ? "" : contentType.toLowerCase(Locale.ROOT)) {
			case "image/jpeg" -> "jpg";
			case "image/png" -> "png";
			case "image/webp" -> "webp";
			default -> throw new InvalidProfileImageException("Unsupported profile image type");
		};
	}

	public record ProfileImageResponse(String profileImageUrl) {
	}

	public static class InvalidProfileImageException extends RuntimeException {

		public InvalidProfileImageException(String message) {
			super(message);
		}
	}
}
