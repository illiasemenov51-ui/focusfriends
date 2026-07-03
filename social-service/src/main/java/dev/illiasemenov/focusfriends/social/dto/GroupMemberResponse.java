package dev.illiasemenov.focusfriends.social.dto;

import dev.illiasemenov.focusfriends.social.entity.GroupMember;

import java.time.Instant;
import java.util.UUID;

public record GroupMemberResponse(
        UUID userId,
        Instant joinedAt
) {
    public static GroupMemberResponse from(GroupMember member) {
        return new GroupMemberResponse(member.getUserId(), member.getJoinedAt());
    }
}
