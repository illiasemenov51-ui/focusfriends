package dev.illiasemenov.focusfriends.social.dto;

import java.util.UUID;

public record LeaderboardEntryResponse(
        UUID userId,
        long points
) {
}
