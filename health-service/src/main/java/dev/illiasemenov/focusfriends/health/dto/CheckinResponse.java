package dev.illiasemenov.focusfriends.health.dto;

import dev.illiasemenov.focusfriends.health.entity.HealthCheckin;

import java.time.LocalDate;
import java.util.UUID;

public record CheckinResponse(
        UUID id,
        LocalDate date,
        double sleepHours,
        int energyLevel,
        int stressLevel,
        int moodLevel,
        Integer caloriesIntake,
        String note
) {
    public static CheckinResponse from(HealthCheckin c) {
        return new CheckinResponse(c.getId(), c.getDate(), c.getSleepHours(), c.getEnergyLevel(),
                c.getStressLevel(), c.getMoodLevel(), c.getCaloriesIntake(), c.getNote());
    }
}
