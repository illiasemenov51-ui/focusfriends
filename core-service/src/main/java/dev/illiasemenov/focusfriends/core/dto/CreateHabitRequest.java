package dev.illiasemenov.focusfriends.core.dto;

import dev.illiasemenov.focusfriends.core.entity.HabitCategory;
import dev.illiasemenov.focusfriends.core.entity.HabitFrequency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateHabitRequest(

        @NotBlank
        @Size(max = 255)
        String title,

        @NotNull
        HabitCategory category,

        HabitFrequency targetFrequency
) {
}
