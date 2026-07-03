package dev.illiasemenov.focusfriends.notification.dto;

import dev.illiasemenov.focusfriends.notification.entity.Notification;
import dev.illiasemenov.focusfriends.notification.entity.NotificationChannel;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        String type,
        String message,
        NotificationChannel channel,
        boolean read,
        Instant createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(n.getId(), n.getType(), n.getMessage(), n.getChannel(), n.isRead(), n.getCreatedAt());
    }
}
