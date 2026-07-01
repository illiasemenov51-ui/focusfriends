package dev.illiasemenov.focusfriends.auth.repository;

import dev.illiasemenov.focusfriends.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
