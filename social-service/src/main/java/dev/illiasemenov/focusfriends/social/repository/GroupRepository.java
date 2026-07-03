package dev.illiasemenov.focusfriends.social.repository;

import dev.illiasemenov.focusfriends.social.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GroupRepository extends JpaRepository<Group, UUID> {
}
