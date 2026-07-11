package dev.illiasemenov.focusfriends.core.dto;

import dev.illiasemenov.focusfriends.core.entity.Task;
import dev.illiasemenov.focusfriends.core.entity.TaskPriority;
import dev.illiasemenov.focusfriends.core.entity.TaskStatus;

import java.time.Instant;
import java.util.UUID;

/**
 * Урезанная версия задачи для ленты друга — без description/deadline,
 * чтобы не светить лишние детали чужих задач.
 */
public record FriendTaskResponse(
        UUID id,
        String title,
        TaskStatus status,
        TaskPriority priority,
        Instant createdAt
) {
    public static FriendTaskResponse from(Task task) {
        return new FriendTaskResponse(
                task.getId(),
                task.getTitle(),
                task.getStatus(),
                task.getPriority(),
                task.getCreatedAt()
        );
    }
}
