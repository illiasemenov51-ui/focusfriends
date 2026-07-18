package dev.illiasemenov.focusfriends.health.repository;

import dev.illiasemenov.focusfriends.health.entity.HealthCheckin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HealthCheckinRepository extends JpaRepository<HealthCheckin, UUID> {

    Optional<HealthCheckin> findByUserIdAndDate(UUID userId, LocalDate date);

    List<HealthCheckin> findAllByUserIdAndDateBetweenOrderByDateAsc(UUID userId, LocalDate from, LocalDate to);
}
