package dev.illiasemenov.focusfriends.auth.dto;

import dev.illiasemenov.focusfriends.auth.entity.ApiToken;

import java.time.Instant;
import java.util.UUID;

public record ApiTokenResponse(
        UUID id,
        String name,
        Instant createdAt,
        Instant lastUsedAt,
        boolean revoked
) {
    public static ApiTokenResponse from(ApiToken token) {
        return new ApiTokenResponse(token.getId(), token.getName(), token.getCreatedAt(),
                token.getLastUsedAt(), token.isRevoked());
    }
}
