package dev.illiasemenov.focusfriends.health.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Внутренний клиент к social-service — проверка дружбы, по тому же паттерну, что в core-service. */
@Component
public class SocialServiceClient {

    private final RestClient restClient;

    public SocialServiceClient(@Value("${social.service.url:http://localhost:8083}") String socialServiceUrl,
                                @Value("${internal.shared-secret}") String internalSharedSecret) {
        this.restClient = RestClient.builder()
                .baseUrl(socialServiceUrl)
                .defaultHeader("X-Internal-Secret", internalSharedSecret)
                .build();
    }

    private record FriendshipDto(UUID id, UUID requesterId, UUID addresseeId, String status, Instant createdAt) {
    }

    public boolean areFriends(UUID userId, UUID otherUserId) {
        try {
            List<FriendshipDto> friendships = restClient.get()
                    .uri("/api/friends")
                    .header("X-User-Id", userId.toString())
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<FriendshipDto>>() {
                    });

            if (friendships == null) return false;

            return friendships.stream().anyMatch(f ->
                    (f.requesterId().equals(userId) && f.addresseeId().equals(otherUserId))
                            || (f.requesterId().equals(otherUserId) && f.addresseeId().equals(userId))
            );
        } catch (Exception e) {
            return false;
        }
    }
}
