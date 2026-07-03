package dev.illiasemenov.focusfriends.social.repository;

import dev.illiasemenov.focusfriends.social.entity.PointsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface PointsEventRepository extends JpaRepository<PointsEvent, UUID> {

    interface UserPoints {
        UUID getUserId();
        Long getTotalPoints();
    }

    @Query("""
            select p.userId as userId, sum(p.points) as totalPoints
            from PointsEvent p
            where p.createdAt >= :since
            group by p.userId
            order by sum(p.points) desc
            """)
    List<UserPoints> findLeaderboard(@Param("since") Instant since);
}
