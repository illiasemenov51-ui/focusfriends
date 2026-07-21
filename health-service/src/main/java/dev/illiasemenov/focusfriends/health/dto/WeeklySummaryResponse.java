package dev.illiasemenov.focusfriends.health.dto;

import java.time.LocalDate;
import java.util.List;

public record WeeklySummaryResponse(
        LocalDate from,
        LocalDate to,
        boolean hasData,
        int checkinsCount,
        double avgSleepHours,
        double avgEnergy,
        double avgStress,
        double avgMood,
        /** null — калории не отмечались ни разу за период. */
        Double avgCalories,
        /** Личная цель пользователя; null — не задана. */
        Integer calorieGoal,
        /** 0..100 — сводный индекс нагрузки, выше = тяжелее неделя. */
        int loadIndex,
        /** Короткие человекочитаемые наблюдения по своим же отметкам — не диагноз. */
        List<String> notes
) {
}
