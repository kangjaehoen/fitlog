package com.fitlog.server.routine.domain;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RoutineScheduleRepository extends JpaRepository<RoutineSchedule, Long> {

	List<RoutineSchedule> findByRoutineId(Long routineId);

	long countByRoutineId(Long routineId);

	void deleteByRoutineId(Long routineId);
}
