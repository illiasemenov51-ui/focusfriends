package dev.illiasemenov.focusfriends.social.repository;

import dev.illiasemenov.focusfriends.social.entity.Friendship;
import dev.illiasemenov.focusfriends.social.entity.FriendshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FriendshipRepository extends JpaRepository<Friendship, UUID> {

    Optional<Friendship> findByRequesterIdAndAddresseeId(UUID requesterId, UUID addresseeId);

    @Query("""
            select f from Friendship f
            where f.status = :status
              and (f.requesterId = :userId or f.addresseeId = :userId)
            """)
    List<Friendship> findAllByUserIdAndStatus(@Param("userId") UUID userId,
                                               @Param("status") FriendshipStatus status);

    boolean existsByRequesterIdAndAddresseeId(UUID requesterId, UUID addresseeId);

    List<Friendship> findAllByAddresseeIdAndStatus(UUID addresseeId, FriendshipStatus status);
}
