package dev.illiasemenov.focusfriends.core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "habit_logs",
        uniqueConstraints = @UniqueConstraint(name = "uk_habit_log_date", columnNames = {"habit_id", "log_date"}),
        indexes = @Index(name = "idx_habit_logs_habit_id", columnList = "habit_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitLog {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "habit_id", nullable = false)
    private UUID habitId;

    @Column(name = "log_date", nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    @Builder.Default
    private boolean completed = true;
}
