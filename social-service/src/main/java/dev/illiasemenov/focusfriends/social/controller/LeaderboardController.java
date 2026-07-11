package dev.illiasemenov.focusfriends.social.controller;

import dev.illiasemenov.focusfriends.social.dto.AwardPointsRequest;
import dev.illiasemenov.focusfriends.social.dto.LeaderboardEntryResponse;
import dev.illiasemenov.focusfriends.social.dto.LeaderboardPeriod;
import dev.illiasemenov.focusfriends.social.service.LeaderboardService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping
    public ResponseEntity<List<LeaderboardEntryResponse>> get(
            @RequestParam(defaultValue = "WEEK") LeaderboardPeriod period) {

        List<LeaderboardEntryResponse> entries = leaderboardService.getLeaderboard(period).stream()
                .map(row -> new LeaderboardEntryResponse(row.getUserId(), row.getTotalPoints()))
                .toList();

        return ResponseEntity.ok(entries);
    }

    /**
     * Внутренний эндпоинт для начисления очков. Вызывается другими сервисами
     * (например, core-service при завершении задачи) напрямую, минуя gateway —
     * поэтому не требует X-User-Id (см. WebConfig).
     */
    @PostMapping("/points")
    public ResponseEntity<Void> awardPoints(@Valid @RequestBody AwardPointsRequest request) {
        leaderboardService.awardPoints(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
