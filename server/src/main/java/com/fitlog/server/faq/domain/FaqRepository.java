package com.fitlog.server.faq.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface FaqRepository extends JpaRepository<Faq, Long> {

	@Query("""
		select f
		from Faq f
		where f.published = true
		order by
			case when f.displayOrder is null then 1 else 0 end,
			f.displayOrder asc,
			f.id desc
		""")
	List<Faq> findPublishedForList();

	Optional<Faq> findByIdAndPublishedTrue(Long id);
}
