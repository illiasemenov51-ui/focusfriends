package dev.illiasemenov.focusfriends.core.dto;

import dev.illiasemenov.focusfriends.core.entity.Habit;
import dev.illiasemenov.focusfriends.core.entity.HabitCategory;
import dev.illiasemenov.focusfriends.core.entity.HabitFrequency;

import java.time.Instant;
import java.util.UUID;

public record HabitResponse(
        UUID id,
        String title,
        HabitCategory category,
        HabitFrequency targetFrequency,
        Instant createdAt
) {
    public static HabitResponse from(Habit habit) {
        return new HabitResponse(
                habit.getId(),
                habit.getTitle(),
                habit.getCategory(),
                habit.getTargetFrequency(),
                habit.getCreatedAt()
        );
    }
}
