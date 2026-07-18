package dev.illiasemenov.focusfriends.social.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Component
public class AuthServiceClient {

    private final RestClient restClient;

    public AuthServiceClient(@Value("${auth.service.url:http://localhost:8081}") String authServiceUrl) {
        this.restClient = RestClient.create(authServiceUrl);
    }

    private record UserDto(UUID id, String name) {
    }

    /** Публичное имя пользователя; при недоступности сервиса — безопасный фолбэк. */
    public String getDisplayName(UUID userId) {
        try {
            UserDto user = restClient.get()
                    .uri("/api/users/{id}", userId)
                    .retrieve()
                    .body(UserDto.class);
            return user != null && user.name() != null ? user.name() : "Игрок";
        } catch (Exception e) {
            return "Игрок";
        }
    }
}
