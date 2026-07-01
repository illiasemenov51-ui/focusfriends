package dev.illiasemenov.focusfriends.auth.service;

import dev.illiasemenov.focusfriends.auth.dto.UpdateUserRequest;
import dev.illiasemenov.focusfriends.auth.entity.User;
import dev.illiasemenov.focusfriends.auth.exception.UserNotFoundException;
import dev.illiasemenov.focusfriends.auth.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getById(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
    }

    @Transactional
    public User update(UUID id, UpdateUserRequest request) {
        User user = getById(id);

        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name());
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }

        return userRepository.save(user);
    }
}
