package dev.illiasemenov.focusfriends.core.repository;

import dev.illiasemenov.focusfriends.core.entity.Habit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HabitRepository extends JpaRepository<Habit, UUID> {

    List<Habit> findAllByUserId(UUID userId);
}
