package com.fitlog.server.goal.domain;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GoalRepository extends JpaRepository<Goal, Long> {

	Optional<Goal> findFirstByUserIdAndActiveTrueOrderByIdDesc(Long userId);
}
