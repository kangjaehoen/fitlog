package com.fitlog.server.routine.domain;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoutineRepository extends JpaRepository<Routine, Long> {

	Optional<Routine> findFirstByUserIdAndActiveTrueOrderByIdDesc(Long userId);

	Optional<Routine> findByIdAndUserIdAndActiveTrue(Long id, Long userId);

	@Query("""
		select coalesce(max(r.displayOrder), 0)
		from Routine r
		where r.userId = :userId
		""")
	int findMaxDisplayOrderByUserId(@Param("userId") Long userId);

	@Query("""
		select r
		from Routine r
		where r.userId = :userId and r.active = true
		order by coalesce(r.displayOrder, 0) desc, r.id desc
		""")
	List<Routine> findActiveRoutinesForOverview(@Param("userId") Long userId);
}
