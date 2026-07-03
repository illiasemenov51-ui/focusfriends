package dev.illiasemenov.focusfriends.core.service;

import dev.illiasemenov.focusfriends.core.dto.CreateHabitRequest;
import dev.illiasemenov.focusfriends.core.dto.UpdateHabitRequest;
import dev.illiasemenov.focusfriends.core.entity.Habit;
import dev.illiasemenov.focusfriends.core.entity.HabitFrequency;
import dev.illiasemenov.focusfriends.core.entity.HabitLog;
import dev.illiasemenov.focusfriends.core.exception.HabitNotFoundException;
import dev.illiasemenov.focusfriends.core.repository.HabitLogRepository;
import dev.illiasemenov.focusfriends.core.repository.HabitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class HabitService {

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;

    public HabitService(HabitRepository habitRepository, HabitLogRepository habitLogRepository) {
        this.habitRepository = habitRepository;
        this.habitLogRepository = habitLogRepository;
    }

    @Transactional
    public Habit create(UUID userId, CreateHabitRequest request) {
        Habit habit = Habit.builder()
                .userId(userId)
                .title(request.title())
                .category(request.category())
                .targetFrequency(request.targetFrequency() != null ? request.targetFrequency() : HabitFrequency.DAILY)
                .build();

        return habitRepository.save(habit);
    }

    public List<Habit> list(UUID userId) {
        return habitRepository.findAllByUserId(userId);
    }

    @Transactional
    public Habit update(UUID userId, UUID habitId, UpdateHabitRequest request) {
        Habit habit = getOwnedHabit(userId, habitId);

        if (request.title() != null && !request.title().isBlank()) {
            habit.setTitle(request.title());
        }
        if (request.category() != null) {
            habit.setCategory(request.category());
        }
        if (request.targetFrequency() != null) {
            habit.setTargetFrequency(request.targetFrequency());
        }

        return habitRepository.save(habit);
    }

    @Transactional
    public void delete(UUID userId, UUID habitId) {
        Habit habit = getOwnedHabit(userId, habitId);
        habitRepository.delete(habit);
    }

    /** Отмечает привычку выполненной на указанную дату (по умолчанию — сегодня). */
    @Transactional
    public HabitLog logCompletion(UUID userId, UUID habitId, LocalDate date) {
        getOwnedHabit(userId, habitId); // проверка владения

        LocalDate targetDate = date != null ? date : LocalDate.now();

        HabitLog log = habitLogRepository.findByHabitIdAndDate(habitId, targetDate)
                .orElseGet(() -> HabitLog.builder()
                        .habitId(habitId)
                        .date(targetDate)
                        .build());

        log.setCompleted(true);
        return habitLogRepository.save(log);
    }

    /**
     * Считает текущую серию дней подряд с выполненной привычкой.
     * Если сегодня ещё не отмечено — начинаем отсчёт со вчера
     * (чтобы серия не сбрасывалась раньше времени в течение дня).
     */
    public int getCurrentStreak(UUID userId, UUID habitId) {
        getOwnedHabit(userId, habitId);

        List<HabitLog> logs = habitLogRepository.findAllByHabitIdOrderByDateDesc(habitId);
        if (logs.isEmpty()) {
            return 0;
        }

        var completedDates = logs.stream()
                .filter(HabitLog::isCompleted)
                .map(HabitLog::getDate)
                .toList();

        LocalDate cursor = LocalDate.now();
        if (!completedDates.contains(cursor)) {
            cursor = cursor.minusDays(1);
        }

        int streak = 0;
        while (completedDates.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }

        return streak;
    }

    private Habit getOwnedHabit(UUID userId, UUID habitId) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new HabitNotFoundException(habitId));

        if (!habit.getUserId().equals(userId)) {
            throw new HabitNotFoundException(habitId);
        }

        return habit;
    }
}
