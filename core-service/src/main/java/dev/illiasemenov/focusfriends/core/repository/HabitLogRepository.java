package dev.illiasemenov.focusfriends.core.repository;

import dev.illiasemenov.focusfriends.core.entity.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HabitLogRepository extends JpaRepository<HabitLog, UUID> {

    Optional<HabitLog> findByHabitIdAndDate(UUID habitId, LocalDate date);

    List<HabitLog> findAllByHabitIdOrderByDateDesc(UUID habitId);

    List<HabitLog> findAllByHabitIdInAndDateBetween(Collection<UUID> habitIds, LocalDate from, LocalDate to);
}
