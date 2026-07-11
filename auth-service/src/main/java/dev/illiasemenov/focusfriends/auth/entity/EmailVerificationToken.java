package dev.illiasemenov.focusfriends.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "email_verification_tokens", indexes = {
        @Index(name = "idx_email_verification_user", columnList = "user_id"),
        @Index(name = "idx_email_verification_token", columnList = "token")
})
public class EmailVerificationToken {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public EmailVerificationToken() {
    }

    public EmailVerificationToken(UUID id, UUID userId, String token, Instant expiresAt, Instant createdAt) {
        this.id = id;
        this.userId = userId;
        this.token = token;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public static EmailVerificationTokenBuilder builder() {
        return new EmailVerificationTokenBuilder();
    }

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public boolean isExpired() {
        return expiresAt.isBefore(Instant.now());
    }

    public static class EmailVerificationTokenBuilder {
        private UUID id;
        private UUID userId;
        private String token;
        private Instant expiresAt;
        private Instant createdAt;

        public EmailVerificationTokenBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public EmailVerificationTokenBuilder userId(UUID userId) {
            this.userId = userId;
            return this;
        }

        public EmailVerificationTokenBuilder token(String token) {
            this.token = token;
            return this;
        }

        public EmailVerificationTokenBuilder expiresAt(Instant expiresAt) {
            this.expiresAt = expiresAt;
            return this;
        }

        public EmailVerificationTokenBuilder createdAt(Instant createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public EmailVerificationToken build() {
            return new EmailVerificationToken(id, userId, token, expiresAt, createdAt);
        }
    }
}
