package dev.illiasemenov.focusfriends.auth.dto;

import dev.illiasemenov.focusfriends.auth.entity.User;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String avatarUrl,
        String email,
        boolean emailVerified,
        Instant createdAt
) {
    /** Полный профиль — только для владельца (/me). */
    public static UserResponse full(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getAvatarUrl(),
                user.getEmail(),
                user.isEmailVerified(),
                user.getCreatedAt()
        );
    }

    /** Публичный профиль — без email, для просмотра другими пользователями. */
    public static UserResponse publicProfile(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getAvatarUrl(),
                null,
                user.isEmailVerified(),
                user.getCreatedAt()
        );
    }
}
