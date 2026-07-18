package dev.illiasemenov.focusfriends.health.repository;

import dev.illiasemenov.focusfriends.health.entity.HealthPrivacySettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface HealthPrivacySettingsRepository extends JpaRepository<HealthPrivacySettings, UUID> {
}
