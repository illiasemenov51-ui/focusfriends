package dev.illiasemenov.focusfriends.core.dto;

import java.time.LocalDate;
import java.util.List;

public record CalendarDayResponse(
        LocalDate date,
        int completedCount,
        List<String> habitTitles
) {
}
