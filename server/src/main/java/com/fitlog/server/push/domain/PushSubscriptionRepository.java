package com.fitlog.server.push.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {

	Optional<PushSubscription> findByEndpoint(String endpoint);

	List<PushSubscription> findByUserId(Long userId);

	void deleteByUserIdAndEndpoint(Long userId, String endpoint);

	void deleteByEndpoint(String endpoint);
}
