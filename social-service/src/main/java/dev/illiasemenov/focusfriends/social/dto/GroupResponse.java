package dev.illiasemenov.focusfriends.social.dto;

import dev.illiasemenov.focusfriends.social.entity.Group;

import java.time.Instant;
import java.util.UUID;

public record GroupResponse(
        UUID id,
        String name,
        UUID ownerId,
        Instant createdAt
) {
    public static GroupResponse from(Group group) {
        return new GroupResponse(group.getId(), group.getName(), group.getOwnerId(), group.getCreatedAt());
    }
}
