package dev.illiasemenov.focusfriends.core.service;

import dev.illiasemenov.focusfriends.core.client.SocialServiceClient;
import dev.illiasemenov.focusfriends.core.dto.CalendarDayResponse;
import dev.illiasemenov.focusfriends.core.dto.CreateHabitRequest;
import dev.illiasemenov.focusfriends.core.dto.UpdateHabitRequest;
import dev.illiasemenov.focusfriends.core.entity.Habit;
import dev.illiasemenov.focusfriends.core.entity.HabitFrequency;
import dev.illiasemenov.focusfriends.core.entity.HabitLog;
import dev.illiasemenov.focusfriends.core.exception.FriendAccessDeniedException;
import dev.illiasemenov.focusfriends.core.exception.HabitNotFoundException;
import dev.illiasemenov.focusfriends.core.repository.HabitLogRepository;
import dev.illiasemenov.focusfriends.core.repository.HabitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class HabitService {

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final SocialServiceClient socialServiceClient;

    public HabitService(HabitRepository habitRepository, HabitLogRepository habitLogRepository,
                         SocialServiceClient socialServiceClient) {
        this.habitRepository = habitRepository;
        this.habitLogRepository = habitLogRepository;
        this.socialServiceClient = socialServiceClient;
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
     * Отмечает привычку выполненной за все дни указанного месяца сразу
     * (удобно, если хочешь заранее запланировать/задним числом заполнить месяц).
     * Дни в будущем (после сегодняшнего) не трогаем — отмечать невыполненное будущее бессмысленно.
     */
    @Transactional
    public List<HabitLog> logMonth(UUID userId, UUID habitId, YearMonth month) {
        getOwnedHabit(userId, habitId); // проверка владения

        LocalDate today = LocalDate.now();
        LocalDate start = month.atDay(1);
        LocalDate end = month.atEndOfMonth();
        if (end.isAfter(today) && YearMonth.from(today).equals(month)) {
            end = today;
        } else if (start.isAfter(today)) {
            // весь месяц ещё не наступил — отмечать нечего
            return List.of();
        }

        List<HabitLog> results = new ArrayList<>();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            LocalDate currentDate = date;
            HabitLog log = habitLogRepository.findByHabitIdAndDate(habitId, currentDate)
                    .orElseGet(() -> HabitLog.builder()
                            .habitId(habitId)
                            .date(currentDate)
                            .build());
            log.setCompleted(true);
            results.add(habitLogRepository.save(log));
        }
        return results;
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

    /** Календарь выполнения привычек владельца за диапазон дат (включительно). */
    public List<CalendarDayResponse> getCalendar(UUID ownerId, LocalDate from, LocalDate to) {
        List<Habit> habits = habitRepository.findAllByUserId(ownerId);
        if (habits.isEmpty()) {
            return List.of();
        }

        Map<UUID, String> titleByHabitId = habits.stream()
                .collect(Collectors.toMap(Habit::getId, Habit::getTitle));

        List<HabitLog> logs = habitLogRepository.findAllByHabitIdInAndDateBetween(titleByHabitId.keySet(), from, to);

        Map<LocalDate, List<String>> titlesByDate = new TreeMap<>();
        for (HabitLog log : logs) {
            if (!log.isCompleted()) continue;
            titlesByDate
                    .computeIfAbsent(log.getDate(), d -> new java.util.ArrayList<>())
                    .add(titleByHabitId.get(log.getHabitId()));
        }

        return titlesByDate.entrySet().stream()
                .map(e -> new CalendarDayResponse(e.getKey(), e.getValue().size(), e.getValue()))
                .sorted(Comparator.comparing(CalendarDayResponse::date))
                .toList();
    }

    /** Календарь друга — только если запрашивающий реально с ним в друзьях. */
    public List<CalendarDayResponse> getFriendCalendar(UUID callerId, UUID friendId, LocalDate from, LocalDate to) {
        if (!socialServiceClient.areFriends(callerId, friendId)) {
            throw new FriendAccessDeniedException();
        }
        return getCalendar(friendId, from, to);
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
