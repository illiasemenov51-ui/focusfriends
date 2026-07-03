package dev.illiasemenov.focusfriends.core.dto;

import dev.illiasemenov.focusfriends.core.entity.HabitCategory;
import dev.illiasemenov.focusfriends.core.entity.HabitFrequency;
import jakarta.validation.constraints.Size;

public record UpdateHabitRequest(

        @Size(max = 255)
        String title,

        HabitCategory category,

        HabitFrequency targetFrequency
) {
}
