package com.fitlog.server.user.domain;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findBySocialTypeAndProviderUserId(SocialType socialType, String providerUserId);

	Optional<User> findByEmailAndSocialType(String email, SocialType socialType);
}
