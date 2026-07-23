package dev.illiasemenov.focusfriends.social.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Component
public class NotificationServiceClient {

    private final RestClient restClient;

    public NotificationServiceClient(@Value("${notification.service.url:http://localhost:8084}") String notificationServiceUrl,
                                      @Value("${internal.shared-secret}") String internalSharedSecret) {
        this.restClient = RestClient.builder()
                .baseUrl(notificationServiceUrl)
                .defaultHeader("X-Internal-Secret", internalSharedSecret)
                .build();
    }

    private record SendRequest(UUID userId, String type, String message, String channel) {
    }

    /**
     * Уведомление — best-effort: если notification-service недоступен,
     * не должно ронять основной сценарий (заявка в друзья и т.п.).
     */
    public void send(UUID userId, String type, String message) {
        try {
            restClient.post()
                    .uri("/api/notifications/send")
                    .body(new SendRequest(userId, type, message, "IN_APP"))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception ignored) {
            // намеренно проглатываем — уведомление не критично для основного флоу
        }
    }
}
