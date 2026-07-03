package dev.illiasemenov.focusfriends.core.dto;

import java.util.UUID;

public record StreakResponse(
        UUID habitId,
        int currentStreak
) {
}
