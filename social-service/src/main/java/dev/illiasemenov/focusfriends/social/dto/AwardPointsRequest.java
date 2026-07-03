package dev.illiasemenov.focusfriends.social.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.UUID;

public record AwardPointsRequest(

        @NotNull
        UUID userId,

        @Positive
        int points,

        @NotBlank
        String reason
) {
}
