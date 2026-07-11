package dev.illiasemenov.focusfriends.core.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Внутренний клиент к social-service — вызывается напрямую по docker-сети,
 * минуя gateway (по той же модели доверия, что и вызов
 * social-service:/api/leaderboard/points — сервис-сервис, а не пользователь-сервис).
 */
@Component
public class SocialServiceClient {

    private final RestClient restClient;

    public SocialServiceClient(@Value("${social.service.url:http://localhost:8083}") String socialServiceUrl) {
        this.restClient = RestClient.create(socialServiceUrl);
    }

    private record FriendshipDto(UUID id, UUID requesterId, UUID addresseeId, String status, Instant createdAt) {
    }

    /** Проверяет, что userId и otherUserId состоят в принятой дружбе. */
    public boolean areFriends(UUID userId, UUID otherUserId) {
        try {
            List<FriendshipDto> friendships = restClient.get()
                    .uri("/api/friends")
                    .header("X-User-Id", userId.toString())
                    .retrieve()
                    .body(new org.springframework.core.ParameterizedTypeReference<List<FriendshipDto>>() {
                    });

            if (friendships == null) {
                return false;
            }

            return friendships.stream().anyMatch(f ->
                    (f.requesterId().equals(userId) && f.addresseeId().equals(otherUserId))
                            || (f.requesterId().equals(otherUserId) && f.addresseeId().equals(userId))
            );
        } catch (Exception e) {
            // social-service недоступен или вернул ошибку — по умолчанию считаем "не друзья",
            // чтобы не открыть чужие данные при сбое зависимого сервиса
            return false;
        }
    }
}
