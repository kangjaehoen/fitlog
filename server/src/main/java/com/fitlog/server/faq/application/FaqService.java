package com.fitlog.server.faq.application;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fitlog.server.faq.domain.Faq;
import com.fitlog.server.faq.domain.FaqRepository;

@Service
public class FaqService {

	private final FaqRepository faqRepository;

	public FaqService(FaqRepository faqRepository) {
		this.faqRepository = faqRepository;
	}

	@Transactional(readOnly = true)
	public List<FaqSummaryResponse> findAll() {
		return this.faqRepository.findPublishedForList()
			.stream()
			.map(FaqSummaryResponse::from)
			.toList();
	}

	@Transactional(readOnly = true)
	public FaqDetailResponse findOne(Long id) {
		return this.faqRepository.findByIdAndPublishedTrue(id)
			.map(FaqDetailResponse::from)
			.orElseThrow(() -> new IllegalArgumentException("FAQ not found"));
	}

	public record FaqSummaryResponse(
		Long id,
		String category,
		String question,
		LocalDateTime updatedAt
	) {

		private static FaqSummaryResponse from(Faq faq) {
			return new FaqSummaryResponse(
				faq.getId(),
				faq.getCategory(),
				faq.getQuestion(),
				faq.getUpdatedAt()
			);
		}
	}

	public record FaqDetailResponse(
		Long id,
		String category,
		String question,
		String answer,
		LocalDateTime updatedAt
	) {

		private static FaqDetailResponse from(Faq faq) {
			return new FaqDetailResponse(
				faq.getId(),
				faq.getCategory(),
				faq.getQuestion(),
				faq.getAnswer(),
				faq.getUpdatedAt()
			);
		}
	}
}
