package dev.illiasemenov.focusfriends.core.controller;

import dev.illiasemenov.focusfriends.core.dto.*;
import dev.illiasemenov.focusfriends.core.entity.Habit;
import dev.illiasemenov.focusfriends.core.entity.HabitLog;
import dev.illiasemenov.focusfriends.core.security.CurrentUserContext;
import dev.illiasemenov.focusfriends.core.service.HabitService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/habits")
public class HabitController {

    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    @PostMapping
    public ResponseEntity<HabitResponse> create(@Valid @RequestBody CreateHabitRequest request) {
        Habit habit = habitService.create(CurrentUserContext.get(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(HabitResponse.from(habit));
    }

    @GetMapping
    public ResponseEntity<List<HabitResponse>> list() {
        List<HabitResponse> habits = habitService.list(CurrentUserContext.get()).stream()
                .map(HabitResponse::from)
                .toList();
        return ResponseEntity.ok(habits);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HabitResponse> update(@PathVariable UUID id,
                                                 @Valid @RequestBody UpdateHabitRequest request) {
        Habit habit = habitService.update(CurrentUserContext.get(), id, request);
        return ResponseEntity.ok(HabitResponse.from(habit));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        habitService.delete(CurrentUserContext.get(), id);
        return ResponseEntity.noContent().build();
    }

    /** Отмечает привычку выполненной. По умолчанию — сегодня; можно передать ?date=YYYY-MM-DD. */
    @PatchMapping("/{id}/log")
    public ResponseEntity<HabitLogResponse> log(
            @PathVariable UUID id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        HabitLog log = habitService.logCompletion(CurrentUserContext.get(), id, date);
        return ResponseEntity.ok(HabitLogResponse.from(log));
    }

    @GetMapping("/{id}/streak")
    public ResponseEntity<StreakResponse> streak(@PathVariable UUID id) {
        int streak = habitService.getCurrentStreak(CurrentUserContext.get(), id);
        return ResponseEntity.ok(new StreakResponse(id, streak));
    }

    /** Свой календарь выполнения привычек за диапазон дат. */
    @GetMapping("/calendar")
    public ResponseEntity<List<CalendarDayResponse>> calendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        return ResponseEntity.ok(habitService.getCalendar(CurrentUserContext.get(), from, to));
    }

    /** Календарь друга — только для принятых дружб. */
    @GetMapping("/friends/{friendId}/calendar")
    public ResponseEntity<List<CalendarDayResponse>> friendCalendar(
            @PathVariable UUID friendId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        return ResponseEntity.ok(habitService.getFriendCalendar(CurrentUserContext.get(), friendId, from, to));
    }
}
