package dev.illiasemenov.focusfriends.core.dto;

import dev.illiasemenov.focusfriends.core.entity.HabitLog;

import java.time.LocalDate;
import java.util.UUID;

public record HabitLogResponse(
        UUID habitId,
        LocalDate date,
        boolean completed
) {
    public static HabitLogResponse from(HabitLog log) {
        return new HabitLogResponse(log.getHabitId(), log.getDate(), log.isCompleted());
    }
}
