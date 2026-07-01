package dev.illiasemenov.focusfriends.auth.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        long expiresInMs
) {
}
