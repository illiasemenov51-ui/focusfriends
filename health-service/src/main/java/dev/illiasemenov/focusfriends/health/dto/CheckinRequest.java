package dev.illiasemenov.focusfriends.health.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CheckinRequest(

        // Если не указана — считаем, что отметка за сегодня.
        LocalDate date,

        @DecimalMin("0.0")
        @DecimalMax("24.0")
        double sleepHours,

        @Min(1) @Max(5)
        int energyLevel,

        @Min(1) @Max(5)
        int stressLevel,

        @Min(1) @Max(5)
        int moodLevel,

        @Size(max = 500)
        String note
) {
}
