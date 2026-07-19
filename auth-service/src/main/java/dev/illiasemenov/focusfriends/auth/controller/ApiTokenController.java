package dev.illiasemenov.focusfriends.auth.controller;

import dev.illiasemenov.focusfriends.auth.dto.ApiTokenResponse;
import dev.illiasemenov.focusfriends.auth.dto.CreateApiTokenRequest;
import dev.illiasemenov.focusfriends.auth.dto.CreateApiTokenResponse;
import dev.illiasemenov.focusfriends.auth.dto.ValidateApiTokenResponse;
import dev.illiasemenov.focusfriends.auth.entity.ApiToken;
import dev.illiasemenov.focusfriends.auth.service.ApiTokenService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Персональные токены для внешних автоматизаций (iOS Shortcuts и т.п.),
 * которые не могут пройти обычный логин/refresh-flow. Создаются и управляются
 * из веб-приложения (обычная JWT-сессия), а используются потом как
 * долгоживущий Bearer-токен напрямую в HTTP-запросах автоматизации.
 */
@RestController
@RequestMapping("/api/auth/api-tokens")
public class ApiTokenController {

    private final ApiTokenService apiTokenService;

    public ApiTokenController(ApiTokenService apiTokenService) {
        this.apiTokenService = apiTokenService;
    }

    @PostMapping
    public ResponseEntity<CreateApiTokenResponse> create(Authentication authentication,
                                                           @Valid @RequestBody CreateApiTokenRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        ApiTokenService.GeneratedToken generated = apiTokenService.generate(userId, request.name());
        ApiToken entity = generated.entity();

        CreateApiTokenResponse response = new CreateApiTokenResponse(
                entity.getId(), entity.getName(), generated.plaintext(), entity.getCreatedAt());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ApiTokenResponse>> list(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        List<ApiTokenResponse> tokens = apiTokenService.list(userId).stream()
                .map(ApiTokenResponse::from)
                .toList();
        return ResponseEntity.ok(tokens);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revoke(Authentication authentication, @PathVariable UUID id) {
        UUID userId = (UUID) authentication.getPrincipal();
        apiTokenService.revoke(userId, id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Внутренний эндпоинт — вызывается только gateway напрямую по docker-сети,
     * никогда пользователем. Публичный (permitAll), потому что на этом этапе
     * у запроса ещё нет обычной аутентификации — токен в X-Api-Token и есть
     * сама проверка.
     */
    @GetMapping("/validate")
    public ResponseEntity<ValidateApiTokenResponse> validate(@RequestHeader("X-Api-Token") String token) {
        UUID userId = apiTokenService.validateAndTouch(token);
        return ResponseEntity.ok(new ValidateApiTokenResponse(userId));
    }
}
