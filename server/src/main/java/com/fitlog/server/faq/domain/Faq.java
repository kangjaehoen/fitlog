package com.fitlog.server.faq.domain;

import com.fitlog.server.common.entity.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
	name = "faqs",
	indexes = {
		@Index(name = "idx_faqs_published_order", columnList = "published, display_order")
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Faq extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "category", length = 80)
	private String category;

	@Column(name = "question", nullable = false, length = 200)
	private String question;

	@Lob
	@Column(name = "answer", nullable = false)
	private String answer;

	@Column(name = "display_order")
	private Integer displayOrder;

	@Column(name = "published", nullable = false)
	private boolean published = true;

	private Faq(
		String category,
		String question,
		String answer,
		Integer displayOrder,
		boolean published
	) {
		this.category = normalize(category);
		this.question = question.trim();
		this.answer = answer.trim();
		this.displayOrder = displayOrder;
		this.published = published;
	}

	public static Faq create(
		String category,
		String question,
		String answer,
		Integer displayOrder,
		boolean published
	) {
		return new Faq(category, question, answer, displayOrder, published);
	}

	private static String normalize(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}

		return value.trim();
	}
}
