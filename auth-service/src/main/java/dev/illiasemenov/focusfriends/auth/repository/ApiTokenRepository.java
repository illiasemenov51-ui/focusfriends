package dev.illiasemenov.focusfriends.auth.repository;

import dev.illiasemenov.focusfriends.auth.entity.ApiToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApiTokenRepository extends JpaRepository<ApiToken, UUID> {

    Optional<ApiToken> findByTokenHash(String tokenHash);

    List<ApiToken> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
}
