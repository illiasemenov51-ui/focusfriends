package dev.illiasemenov.focusfriends.health.controller;

import dev.illiasemenov.focusfriends.health.dto.CheckinRequest;
import dev.illiasemenov.focusfriends.health.dto.CheckinResponse;
import dev.illiasemenov.focusfriends.health.dto.HealthSettingsResponse;
import dev.illiasemenov.focusfriends.health.dto.UpdateHealthSettingsRequest;
import dev.illiasemenov.focusfriends.health.dto.WeeklySummaryResponse;
import dev.illiasemenov.focusfriends.health.entity.HealthCheckin;
import dev.illiasemenov.focusfriends.health.entity.HealthSettings;
import dev.illiasemenov.focusfriends.health.security.CurrentUserContext;
import dev.illiasemenov.focusfriends.health.service.HealthService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    @PostMapping("/checkins")
    public ResponseEntity<CheckinResponse> checkin(@Valid @RequestBody CheckinRequest request) {
        HealthCheckin checkin = healthService.upsert(CurrentUserContext.get(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(CheckinResponse.from(checkin));
    }

    @GetMapping("/checkins")
    public ResponseEntity<List<CheckinResponse>> list(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        List<CheckinResponse> checkins = healthService.listOwn(CurrentUserContext.get(), from, to).stream()
                .map(CheckinResponse::from)
                .toList();
        return ResponseEntity.ok(checkins);
    }

    /** Сводка за последние 7 дней: средние значения (сон/энергия/стресс/настроение/калории) + наблюдения. */
    @GetMapping("/summary")
    public ResponseEntity<WeeklySummaryResponse> summary() {
        return ResponseEntity.ok(healthService.getOwnSummary(CurrentUserContext.get()));
    }

    /** Сводка друга — только если вы друзья и он делится своим здоровьем. */
    @GetMapping("/friends/{friendId}/summary")
    public ResponseEntity<WeeklySummaryResponse> friendSummary(@PathVariable UUID friendId) {
        return ResponseEntity.ok(healthService.getFriendSummary(CurrentUserContext.get(), friendId));
    }

    /** Настройки раздела: делиться ли с друзьями + личная цель по калориям. */
    @GetMapping("/settings")
    public ResponseEntity<HealthSettingsResponse> getSettings() {
        HealthSettings settings = healthService.getSettings(CurrentUserContext.get());
        return ResponseEntity.ok(new HealthSettingsResponse(settings.isShareWithFriends(), settings.getCalorieGoal()));
    }

    @PutMapping("/settings")
    public ResponseEntity<HealthSettingsResponse> updateSettings(@Valid @RequestBody UpdateHealthSettingsRequest request) {
        HealthSettings settings = healthService.updateSettings(
                CurrentUserContext.get(), request.shareWithFriends(), request.calorieGoal());
        return ResponseEntity.ok(new HealthSettingsResponse(settings.isShareWithFriends(), settings.getCalorieGoal()));
    }
}
