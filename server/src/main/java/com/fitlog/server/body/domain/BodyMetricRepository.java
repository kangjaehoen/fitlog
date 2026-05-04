package com.fitlog.server.body.domain;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BodyMetricRepository extends JpaRepository<BodyMetric, Long> {

	Optional<BodyMetric> findFirstByUserIdAndMeasuredOnLessThanEqualOrderByMeasuredOnDescIdDesc(Long userId, LocalDate measuredOn);

	Optional<BodyMetric> findFirstByUserIdAndMeasuredOnBeforeOrderByMeasuredOnDescIdDesc(Long userId, LocalDate measuredOn);

	Optional<BodyMetric> findByUserIdAndMeasuredOn(Long userId, LocalDate measuredOn);

	List<BodyMetric> findTop5ByUserIdOrderByMeasuredOnDescIdDesc(Long userId);

	@Query("""
		select distinct metric.measuredOn
		from BodyMetric metric
		where metric.userId = :userId
			and metric.measuredOn between :startDate and :endDate
		""")
	List<LocalDate> findRecordedDatesByUserIdBetween(
		@Param("userId") Long userId,
		@Param("startDate") LocalDate startDate,
		@Param("endDate") LocalDate endDate
	);
}
