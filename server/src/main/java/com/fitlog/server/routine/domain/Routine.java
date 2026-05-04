package com.fitlog.server.routine.domain;

import com.fitlog.server.common.entity.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
	name = "routines",
	indexes = {
		@Index(name = "idx_routines_user_active", columnList = "user_id, active")
	}
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Routine extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "name", nullable = false, length = 80)
	private String name;

	@Column(name = "description", length = 500)
	private String description;

	@Column(name = "active", nullable = false)
	private boolean active = true;

	@Column(name = "display_order")
	private Integer displayOrder;

	private Routine(Long userId, String name, String description, Integer displayOrder) {
		this.userId = userId;
		this.name = name;
		this.description = description;
		this.active = true;
		this.displayOrder = displayOrder;
	}

	public static Routine create(Long userId, String name, String description, Integer displayOrder) {
		return new Routine(userId, name, description, displayOrder);
	}

	public void update(String name, String description) {
		this.name = name;
		this.description = description;
	}

	public void updateDisplayOrder(Integer displayOrder) {
		this.displayOrder = displayOrder;
	}

	public void deactivate() {
		this.active = false;
	}
}
