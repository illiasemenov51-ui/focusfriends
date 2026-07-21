package dev.illiasemenov.focusfriends.health.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/** Личные настройки раздела "Самочувствие": приватность + цель по калориям. */
@Entity
@Table(name = "health_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthSettings {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    /** По умолчанию включено — по решению пользователя (как в рейтинге очков). */
    @Column(name = "share_with_friends", nullable = false)
    @Builder.Default
    private boolean shareWithFriends = true;

    /** Дневная цель по калориям; null — цель не задана. */
    @Column(name = "calorie_goal")
    private Integer calorieGoal;
}
