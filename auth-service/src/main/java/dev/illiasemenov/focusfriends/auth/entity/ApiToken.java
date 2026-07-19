package dev.illiasemenov.focusfriends.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Долгоживущий персональный токен для внешних автоматизаций (например,
 * iOS Shortcuts), которые не могут проходить обычный логин/refresh-flow.
 * В отличие от access-токена (15 мин), не истекает сам — только по отзыву.
 * Хранится хэш (SHA-256), не сам токен — как GitHub PAT.
 */
@Entity
@Table(name = "api_tokens", indexes = {
        @Index(name = "idx_api_tokens_user_id", columnList = "user_id"),
        @Index(name = "idx_api_tokens_token_hash", columnList = "token_hash", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiToken {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "last_used_at")
    private Instant lastUsedAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean revoked = false;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
