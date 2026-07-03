package dev.illiasemenov.focusfriends.core.dto;

import dev.illiasemenov.focusfriends.core.entity.TaskPriority;
import dev.illiasemenov.focusfriends.core.entity.TaskStatus;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record UpdateTaskRequest(

        @Size(max = 255)
        String title,

        @Size(max = 2000)
        String description,

        Instant deadline,

        TaskPriority priority,

        TaskStatus status
) {
}
