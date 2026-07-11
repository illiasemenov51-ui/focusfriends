package dev.illiasemenov.focusfriends.auth.repository;

import dev.illiasemenov.focusfriends.auth.entity.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {

    Optional<EmailVerificationToken> findByToken(String token);

    @Modifying
    @Query("delete from EmailVerificationToken t where t.userId = :userId")
    void deleteAllByUserId(@Param("userId") UUID userId);
}
