package dev.illiasemenov.focusfriends.social.dto;

import dev.illiasemenov.focusfriends.social.entity.Friendship;
import dev.illiasemenov.focusfriends.social.entity.FriendshipStatus;

import java.time.Instant;
import java.util.UUID;

public record FriendshipResponse(
        UUID id,
        UUID requesterId,
        UUID addresseeId,
        FriendshipStatus status,
        Instant createdAt
) {
    public static FriendshipResponse from(Friendship f) {
        return new FriendshipResponse(f.getId(), f.getRequesterId(), f.getAddresseeId(), f.getStatus(), f.getCreatedAt());
    }
}
