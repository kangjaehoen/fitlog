package com.fitlog.server.faq.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.fitlog.server.faq.application.FaqService;

@RestController
@RequestMapping("/api/faqs")
public class FaqController {

	private final FaqService faqService;

	public FaqController(FaqService faqService) {
		this.faqService = faqService;
	}

	@GetMapping
	public List<FaqService.FaqSummaryResponse> findAll() {
		return this.faqService.findAll();
	}

	@GetMapping("/{id}")
	public FaqService.FaqDetailResponse findOne(@PathVariable Long id) {
		try {
			return this.faqService.findOne(id);
		}
		catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, exception.getMessage());
		}
	}
}
