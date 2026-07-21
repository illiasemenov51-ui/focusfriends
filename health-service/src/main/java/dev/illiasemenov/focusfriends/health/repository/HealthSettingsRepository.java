package dev.illiasemenov.focusfriends.health.repository;

import dev.illiasemenov.focusfriends.health.entity.HealthSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface HealthSettingsRepository extends JpaRepository<HealthSettings, UUID> {
}
