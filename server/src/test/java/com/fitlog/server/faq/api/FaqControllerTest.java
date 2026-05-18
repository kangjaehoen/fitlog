package com.fitlog.server.faq.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.fitlog.server.faq.domain.Faq;
import com.fitlog.server.faq.domain.FaqRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FaqControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private FaqRepository faqRepository;

	@AfterEach
	void tearDown() {
		this.faqRepository.deleteAll();
	}

	@Test
	void faqListReturnsOnlyPublishedFaqsInDisplayOrder() throws Exception {
		this.faqRepository.save(Faq.create("Account", "Hidden question", "Hidden answer", 1, false));
		this.faqRepository.save(Faq.create("Workout", "Second question", "Second answer", 2, true));
		this.faqRepository.save(Faq.create("Account", "First question", "First answer", 1, true));

		this.mockMvc.perform(get("/api/faqs"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.length()").value(2))
			.andExpect(jsonPath("$[0].question").value("First question"))
			.andExpect(jsonPath("$[0].category").value("Account"))
			.andExpect(jsonPath("$[1].question").value("Second question"));
	}

	@Test
	void faqListCanBeEmptyWithoutMockData() throws Exception {
		this.mockMvc.perform(get("/api/faqs"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.length()").value(0));
	}

	@Test
	void faqDetailReturnsPublishedFaq() throws Exception {
		Faq faq = this.faqRepository.save(Faq.create("Account", "How do I change my profile?", "Use the profile screen.", 1, true));

		this.mockMvc.perform(get("/api/faqs/{id}", faq.getId()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.id").value(faq.getId()))
			.andExpect(jsonPath("$.question").value("How do I change my profile?"))
			.andExpect(jsonPath("$.answer").value("Use the profile screen."));
	}

	@Test
	void faqDetailReturnsNotFoundForMissingOrUnpublishedFaq() throws Exception {
		Faq faq = this.faqRepository.save(Faq.create("Account", "Hidden question", "Hidden answer", 1, false));

		this.mockMvc.perform(get("/api/faqs/{id}", faq.getId()))
			.andExpect(status().isNotFound());

		this.mockMvc.perform(get("/api/faqs/{id}", 999999L))
			.andExpect(status().isNotFound());
	}
}
