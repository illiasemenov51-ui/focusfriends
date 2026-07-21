package dev.illiasemenov.focusfriends.health.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateHealthSettingsRequest(
        @NotNull
        Boolean shareWithFriends,

        // null — снять цель
        @Min(0) @Max(20000)
        Integer calorieGoal
) {
}
