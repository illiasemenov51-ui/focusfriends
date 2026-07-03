package dev.illiasemenov.focusfriends.social.service;

import dev.illiasemenov.focusfriends.social.dto.AwardPointsRequest;
import dev.illiasemenov.focusfriends.social.dto.LeaderboardPeriod;
import dev.illiasemenov.focusfriends.social.entity.PointsEvent;
import dev.illiasemenov.focusfriends.social.repository.PointsEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class LeaderboardService {

    private final PointsEventRepository pointsEventRepository;

    public LeaderboardService(PointsEventRepository pointsEventRepository) {
        this.pointsEventRepository = pointsEventRepository;
    }

    @Transactional
    public PointsEvent awardPoints(AwardPointsRequest request) {
        PointsEvent event = PointsEvent.builder()
                .userId(request.userId())
                .points(request.points())
                .reason(request.reason())
                .build();

        return pointsEventRepository.save(event);
    }

    public List<PointsEventRepository.UserPoints> getLeaderboard(LeaderboardPeriod period) {
        Instant since = switch (period) {
            case WEEK -> Instant.now().minus(7, ChronoUnit.DAYS);
            case MONTH -> Instant.now().minus(30, ChronoUnit.DAYS);
            case ALL -> Instant.EPOCH;
        };

        return pointsEventRepository.findLeaderboard(since);
    }
}
