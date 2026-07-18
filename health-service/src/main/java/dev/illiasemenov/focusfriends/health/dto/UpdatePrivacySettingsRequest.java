package dev.illiasemenov.focusfriends.health.dto;

import jakarta.validation.constraints.NotNull;

public record UpdatePrivacySettingsRequest(
        @NotNull
        Boolean shareWithFriends
) {
}
