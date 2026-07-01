package dev.illiasemenov.focusfriends.auth.controller;

import dev.illiasemenov.focusfriends.auth.dto.UpdateUserRequest;
import dev.illiasemenov.focusfriends.auth.dto.UserResponse;
import dev.illiasemenov.focusfriends.auth.entity.User;
import dev.illiasemenov.focusfriends.auth.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        User user = userService.getById(userId);
        return ResponseEntity.ok(UserResponse.full(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(Authentication authentication,
                                                  @Valid @RequestBody UpdateUserRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        User updated = userService.update(userId, request);
        return ResponseEntity.ok(UserResponse.full(updated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> publicProfile(@PathVariable UUID id) {
        User user = userService.getById(id);
        return ResponseEntity.ok(UserResponse.publicProfile(user));
    }
}
