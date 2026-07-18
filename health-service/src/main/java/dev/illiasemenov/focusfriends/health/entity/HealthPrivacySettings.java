package dev.illiasemenov.focusfriends.health.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "health_privacy_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthPrivacySettings {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    /** По умолчанию включено — по решению пользователя (как в рейтинге очков). */
    @Column(name = "share_with_friends", nullable = false)
    @Builder.Default
    private boolean shareWithFriends = true;
}
