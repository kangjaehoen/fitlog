package com.fitlog.server.workout.domain;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {

	List<WorkoutSession> findByUserIdAndSessionDate(Long userId, LocalDate sessionDate);

	List<WorkoutSession> findByUserIdAndSessionDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

	Optional<WorkoutSession> findFirstByUserIdAndSessionDateOrderByStartedAtDescIdDesc(Long userId, LocalDate sessionDate);

	@Query("""
		select distinct session.sessionDate
		from WorkoutSession session
		where session.userId = :userId
			and session.sessionDate between :startDate and :endDate
		""")
	List<LocalDate> findRecordedDatesByUserIdBetween(
		@Param("userId") Long userId,
		@Param("startDate") LocalDate startDate,
		@Param("endDate") LocalDate endDate
	);
}
