package dev.illiasemenov.focusfriends.auth.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Component
public class NotificationServiceClient {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceClient.class);

    private final RestClient restClient;

    public NotificationServiceClient(@Value("${notification.service.url:http://localhost:8084}") String notificationServiceUrl,
                                      @Value("${internal.shared-secret}") String internalSharedSecret) {
        this.restClient = RestClient.builder()
                .baseUrl(notificationServiceUrl)
                .defaultHeader("X-Internal-Secret", internalSharedSecret)
                .build();
    }

    private record SendNotificationDto(UUID userId, String type, String message, String channel, String recipientEmail) {
    }

    public void sendVerificationEmail(UUID userId, String recipientEmail, String verificationLink) {
        String message = "Подтверди свою почту в FocusFriends, перейдя по ссылке: " + verificationLink
                + " (ссылка активна 24 часа)";

        send(userId, "EMAIL_VERIFICATION", message, recipientEmail);
    }

    public void sendPasswordResetEmail(UUID userId, String recipientEmail, String resetLink) {
        String message = "Сбрось пароль FocusFriends по ссылке: " + resetLink
                + " (ссылка активна 24 часа)";

        send(userId, "PASSWORD_RESET", message, recipientEmail);
    }

    private void send(UUID userId, String type, String message, String recipientEmail) {
        try {
            restClient.post()
                    .uri("/api/notifications/send")
                    .body(new SendNotificationDto(userId, type, message, "EMAIL", recipientEmail))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.warn("Не удалось отправить email-уведомление userId={}, type={}: {}", userId, type, e.getMessage());
        }
    }
}
