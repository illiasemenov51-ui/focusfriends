package dev.illiasemenov.focusfriends.auth.dto;

import java.time.Instant;
import java.util.UUID;

/** Единственный раз, когда токен виден в открытом виде — сразу после создания. */
public record CreateApiTokenResponse(
        UUID id,
        String name,
        String token,
        Instant createdAt
) {
}
