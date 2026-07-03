package dev.illiasemenov.focusfriends.notification.dto;

import dev.illiasemenov.focusfriends.notification.entity.NotificationChannel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SendNotificationRequest(

        @NotNull
        UUID userId,

        @NotBlank
        String type,

        @NotBlank
        String message,

        NotificationChannel channel
) {
}
