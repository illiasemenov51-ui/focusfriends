package dev.illiasemenov.focusfriends.health.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "health_checkins",
        uniqueConstraints = @UniqueConstraint(name = "uk_health_checkin_user_date", columnNames = {"user_id", "date"}),
        indexes = @Index(name = "idx_health_checkins_user_date", columnList = "user_id, date"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthCheckin {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private LocalDate date;

    /** Часы сна за прошлую ночь. */
    @Column(name = "sleep_hours", nullable = false)
    private double sleepHours;

    /** 1 (нет сил) .. 5 (полон энергии). */
    @Column(name = "energy_level", nullable = false)
    private int energyLevel;

    /** 1 (спокоен) .. 5 (сильный стресс). */
    @Column(name = "stress_level", nullable = false)
    private int stressLevel;

    /** 1 (плохое настроение) .. 5 (отличное). */
    @Column(name = "mood_level", nullable = false)
    private int moodLevel;

    /** Съедено калорий за день; null — не отмечено сегодня. */
    @Column(name = "calories_intake")
    private Integer caloriesIntake;

    @Column(length = 500)
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
