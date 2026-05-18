package com.fitlog.server.common.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.fitlog.server.account.application.ProfileImageStorageProperties;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	private final CorsProperties corsProperties;
	private final ProfileImageStorageProperties profileImageStorageProperties;

	public WebConfig(CorsProperties corsProperties, ProfileImageStorageProperties profileImageStorageProperties) {
		this.corsProperties = corsProperties;
		this.profileImageStorageProperties = profileImageStorageProperties;
	}

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		if (this.corsProperties.allowedOrigins().isEmpty()) {
			return;
		}

		registry.addMapping("/api/**")
			.allowedOrigins(this.corsProperties.allowedOrigins().toArray(String[]::new))
			.allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
			.allowedHeaders("*")
			.allowCredentials(true);
	}

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		Path storageRoot = Paths.get(this.profileImageStorageProperties.storagePath())
			.toAbsolutePath()
			.normalize();

		registry.addResourceHandler(profileImageResourcePattern())
			.addResourceLocations(storageRoot.toUri().toString());
	}

	private String profileImageResourcePattern() {
		String publicPath = this.profileImageStorageProperties.publicPath();
		String normalizedPublicPath = publicPath.startsWith("/") ? publicPath : "/" + publicPath;
		if (normalizedPublicPath.endsWith("/")) {
			normalizedPublicPath = normalizedPublicPath.substring(0, normalizedPublicPath.length() - 1);
		}

		return normalizedPublicPath + "/**";
	}
}
